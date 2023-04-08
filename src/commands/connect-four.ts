import type { ChatInputCommandInteraction, Message } from "discord.js";
import { ConnectFourReacts } from "btbot-types";
import { ApplicationCommandOptionType } from "discord.js";

import {
	Api,
	buildConnectFourChallengeResponse,
	buildConnectFourMoveResponse,
	getInteractionOptionValue,
	getUserIdFromMentionOrUsername
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
			description: "The @mention or username of the user to challenge",
			type: ApplicationCommandOptionType.String
		},
		{
			name: "bet",
			description: "The number of BillyBucks to bet on the game",
			type: ApplicationCommandOptionType.Integer,
			minValue: 1
		}
	],
	handler: async (int: ChatInputCommandInteraction) => {
		const user = getInteractionOptionValue<string>("user", int);
		if (!user) {
			const game = await Api.get<IConnectFour>(
				`gamble/connectfour/server/${int.guild.id}?user_id=${int.user.id}`
			);
			if (!game || Object.entries(game).length === 0)
				throw "You do not have an active game of Connect Four!\n\nChallenge another player:\n`!connectfour [username/@user] [bet]`";
			await sendConnectFourResponseInteraction(int, buildConnectFourMoveResponse(game), game);
			return;
		}
		const targetUserId = getUserIdFromMentionOrUsername(user, int.guild);
		const bet = getInteractionOptionValue<number>("bet", int);
		if (bet && bet < 0)
			throw "Optional `bet` argument must be a non-negative number if specified!\n\nUsage: `!connectfour [username/@user] [bet]`";
		const data = await Api.post<IConnectFour>("gamble/connectfour/challenge", {
			server_id: int.guild.id,
			user_id: int.user.id,
			mentioned_user_id: targetUserId,
			wager: bet || 0
		});
		const response = data.is_accepted
			? buildConnectFourMoveResponse(data)
			: buildConnectFourChallengeResponse(data);

		await sendConnectFourResponseInteraction(int, response, data);
	}
};

export const sendConnectFourResponseMessage = async (
	channel: DiscordChannel,
	response: string,
	data: IConnectFour
) => {
	const message = await channel.send(response);
	if (data.is_accepted && !data.is_complete) await reactWithConnectFourMoves(message);
};

const sendConnectFourResponseInteraction = async (
	int: ChatInputCommandInteraction,
	response: string,
	data: IConnectFour
) => {
	const replyInt = await int.reply(response);
	if (data.is_accepted && !data.is_complete) {
		const replyMsg = await replyInt.fetch();
		await reactWithConnectFourMoves(replyMsg);
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
