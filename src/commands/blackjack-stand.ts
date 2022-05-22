import type { Message, MessageReaction } from "discord.js";

import type { BlackJackGameResponse, DiscordChannel, ICommand } from "../types";
import { Api, buildBlackjackResponse } from "../helpers";

export const blackjackStandCommand: ICommand = {
	prefix: /.*!stand.*/gim,
	command: "!stand",
	description: "Stand in your current game of Blackjack",
	handler: async (msg: Message) => {
		return await stand(msg.guild.id, msg.author.id, msg.channel);
	},
	reactHandler: async (react: MessageReaction, sender_id: string) => {
		return await stand(react.message.guild.id, sender_id, react.message.channel);
	}
};

const stand = async (server_id: string, user_id: string, channel: DiscordChannel) => {
	const data = await Api.post<BlackJackGameResponse>("gamble/blackjack/stand", {
		server_id,
		user_id
	});
	const response = buildBlackjackResponse(data, user_id);
	channel.send(response);
	return;
};
