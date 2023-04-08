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

import type { IConnectFour } from "btbot-types";
import type { DiscordChannel, ICommand } from "../types";

export const connectFourCommand: ICommand = {
	prefix: /.*!connectfour.*/gim,
	command: "!connectfour",
	description:
		"Let's play Connect Four! Usage: `!connectfour` to view active game or `!connectfour [username/@user] [bet]` to challenge",
	handler: async (msg: Message) => {
		const args = msg.content.slice("!connectfour".length).trim().split(" ");

		// display status of active game if no arguments are provided
		if (!args[0]) {
			const game = await Api.get<IConnectFour>(
				`gamble/connectfour/server/${msg.guild.id}?user_id=${msg.author.id}`
			);
			if (!game || Object.entries(game).length === 0)
				throw "You do not have an active game of Connect Four!\n\nChallenge another player:\n`!connectfour [username/@user] [bet]`";

			await sendConnectFourResponseMessage(
				msg.channel,
				buildConnectFourMoveResponse(game),
				game
			);
			return;
		}

		const mentionedUser =
			msg.mentions.members.first() ||
			msg.guild.members.cache.find(
				(a) => a.user.username.toUpperCase().trim() === args[0].toUpperCase().trim()
			);
		if (!mentionedUser)
			throw `User \`${args[0]}\` not found!\n\nChallenge another player:\n\`!connectfour [username/@user] [bet]\``;

		const bet = msg.content.slice("!connectfour".length).trim().split(" ")[1];
		if ((typeof bet !== "undefined" && isNaN(parseInt(bet))) || parseInt(bet) < 0)
			throw "Optional `bet` argument must be a non-negative number if specified!\n\nUsage: `!connectfour [username/@user] [bet]`";

		const data = await Api.post<IConnectFour>("gamble/connectfour/challenge", {
			server_id: msg.guild.id,
			user_id: msg.author.id,
			mentioned_user_id: mentionedUser.id,
			wager: parseInt(bet) || 0
		});

		const response = data.is_accepted
			? buildConnectFourMoveResponse(data)
			: buildConnectFourChallengeResponse(data, msg.author.username);

		await sendConnectFourResponseMessage(msg.channel, response, data);
	},
	slash: {
		name: "connectfour",
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
				await sendConnectFourResponseInteraction(
					int,
					buildConnectFourMoveResponse(game),
					game
				);
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
				: buildConnectFourChallengeResponse(data, int.user.username);

			await sendConnectFourResponseInteraction(int, response, data);
		}
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
