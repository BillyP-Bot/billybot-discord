import type { ChatInputCommandInteraction, Message } from "discord.js";
import { ConnectFourReacts } from "btbot-types";
import { ApplicationCommandOptionType } from "discord.js";

import {
	Api,
	buildConnectFourChallengeResponse,
	buildConnectFourMoveResponse,
	getInteractionOptionValue
} from "../helpers";
import { CommandNames } from "../types/enums";

import type { IConnectFour } from "btbot-types";
import type { DiscordChannel, ISlashCommand } from "../types";

export const connectFourCommand: ISlashCommand = {
	name: CommandNames.connectfour,
	description: "Let's play Connect Four!",
	options: [
		{
			name: "user",
			description:
				"The user you want to send a new challenge to or accept an existing challenge from",
			type: ApplicationCommandOptionType.User,
			required: true
		},
		{
			name: "bet",
			description: "The number of BillyBucks to bet on the game",
			type: ApplicationCommandOptionType.Integer,
			min_value: 1
		}
	],
	handler: async (int: ChatInputCommandInteraction) => {
		await int.deferReply();
		const targetUserId = getInteractionOptionValue<string>("user", int);
		const bet = getInteractionOptionValue<number>("bet", int);
		const { response, data } = await connectFour(int.guild.id, int.user.id, targetUserId, bet);
		await sendConnectFourResponse(int, response, data);
	}
};

const connectFour = async (
	server_id: string,
	user_id: string,
	mentioned_user_id: string,
	bet: number
) => {
	if (bet && bet < 0) throw "The `bet` option must be a positive integer if specified!";
	const data = await Api.post<IConnectFour>("gamble/connectfour/challenge", {
		server_id,
		user_id,
		mentioned_user_id,
		wager: bet || 0
	});
	return {
		response: data.is_accepted
			? buildConnectFourMoveResponse(data)
			: buildConnectFourChallengeResponse(data),
		data
	};
};

export const sendConnectFourResponseMessage = async (
	channel: DiscordChannel,
	response: string,
	data: IConnectFour
) => {
	const message = await channel.send(response);
	if (data.is_accepted && !data.is_complete) await reactWithConnectFourMoves(message);
};

const sendConnectFourResponse = async (
	int: ChatInputCommandInteraction,
	response: string,
	data: IConnectFour
) => {
	const replyInt = await int.editReply(response);
	if (data.is_accepted && !data.is_complete) {
		await reactWithConnectFourMoves(replyInt);
	}
};

const reactWithConnectFourMoves = async (msg: Message) =>
	Promise.all([
		msg.react(ConnectFourReacts.one),
		msg.react(ConnectFourReacts.two),
		msg.react(ConnectFourReacts.three),
		msg.react(ConnectFourReacts.four),
		msg.react(ConnectFourReacts.five),
		msg.react(ConnectFourReacts.six),
		msg.react(ConnectFourReacts.seven)
	]);
