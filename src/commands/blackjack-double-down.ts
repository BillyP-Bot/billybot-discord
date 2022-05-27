import type { Message, MessageReaction } from "discord.js";

import type { BlackJackGameResponse, DiscordChannel, ICommand } from "../types";
import { Api, buildBlackjackResponse } from "../helpers";

export const blackjackDoubleDownCommand: ICommand = {
	prefix: /.*!doubledown.*/gim,
	command: "!doubledown",
	description: "Double down and hit in Blackjack, must be turn 1!",
	handler: async (msg: Message) => {
		return await doubleDown(msg.guild.id, msg.author.id, msg.channel);
	},
	reactHandler: async (react: MessageReaction, sender_id: string) => {
		return await doubleDown(react.message.guild.id, sender_id, react.message.channel);
	}
};

const doubleDown = async (server_id: string, user_id: string, channel: DiscordChannel) => {
	const data = await Api.post<BlackJackGameResponse>("gamble/blackjack/hit", {
		server_id,
		user_id,
		double_down: true
	});
	const response = buildBlackjackResponse(data, user_id);
	channel.send(response);
	return;
};
