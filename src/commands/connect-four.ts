import type { Message } from "discord.js";

import type { IConnectFour } from "btbot-types";
import { ConnectFourReacts } from "btbot-types";

import { Api, buildConnectFourChallengeResponse, buildConnectFourMoveResponse } from "../helpers";

import type { DiscordChannel, ICommand } from "../types";

export const connectFourCommand: ICommand = {
	prefix: /.*!connectfour.*/gim,
	command: "!connectfour",
	description:
		"Let's play Connect Four! Usage: `!connectfour` to view active game or `!connectfour [username/@user] [wager]` to challenge",
	handler: async (msg: Message) => {
		const args = msg.content.slice("!connectfour".length).trim().split(" ");

		// display status of active game if no arguments are provided
		if (!args[0]) {
			const game = await Api.get<IConnectFour>(
				`gamble/connectfour/server/${msg.guild.id}?user_id=${msg.author.id}`
			);
			if (Object.entries(game).length === 0)
				throw "You do not have an active game of Connect Four!\n\nChallenge another player:\n`!connectfour [username/@user] [wager]`";

			await sendConnectFourResponseMessage(
				msg.channel,
				buildConnectFourMoveResponse(game),
				game
			);
			return;
		}

		const mentionedUser =
			msg.mentions.members.array()[0] ||
			msg.guild.members.cache.find(
				(a) => a.user.username.toUpperCase().trim() === args[0].toUpperCase().trim()
			);
		if (!mentionedUser)
			throw `User \`${args[0]}\` not found!\n\nChallenge another player:\n\`!connectfour [username/@user] [wager]\``;

		const wager = msg.content.slice("!connectfour".length).trim().split(" ")[1];
		if ((typeof wager !== "undefined" && isNaN(parseInt(wager))) || parseInt(wager) < 0)
			throw "Optional `wager` argument must be a non-negative number if specified!\n\nUsage: `!connectfour [username/@user] [wager]`";

		const data = await Api.post<IConnectFour>("gamble/connectfour/challenge", {
			server_id: msg.guild.id,
			user_id: msg.author.id,
			mentioned_user_id: mentionedUser.id,
			wager: parseInt(wager) || 0
		});

		const response = data.is_accepted
			? buildConnectFourMoveResponse(data)
			: buildConnectFourChallengeResponse(data, msg);

		await sendConnectFourResponseMessage(msg.channel, response, data);
		return;
	}
};

export const sendConnectFourResponseMessage = async (
	channel: DiscordChannel,
	response: string,
	data: IConnectFour
) => {
	const message = await channel.send(response);

	if (data.is_accepted && !data.is_complete)
		await Promise.all([
			message.react(ConnectFourReacts.one),
			message.react(ConnectFourReacts.two),
			message.react(ConnectFourReacts.three),
			message.react(ConnectFourReacts.four),
			message.react(ConnectFourReacts.five),
			message.react(ConnectFourReacts.six),
			message.react(ConnectFourReacts.seven)
		]);
};
