import type { ChatInputCommandInteraction, Message, MessageReaction } from "discord.js";

import type { BlackJackGameResponse, ICommand } from "../types";
import { Api, buildBlackjackResponse } from "../helpers";

export const blackjackDoubleDownCommand: ICommand = {
	prefix: /.*!doubledown.*/gim,
	command: "!doubledown",
	description: "Double down in your current blackjack hand",
	handler: async (msg: Message) => {
		const response = await doubleDown(msg.guild.id, msg.author.id);
		await msg.channel.send(response);
	},
	reactHandler: async (react: MessageReaction, sender_id: string) => {
		const response = await doubleDown(react.message.guild.id, sender_id);
		await react.message.channel.send(response);
	},
	slash: {
		name: "doubledown",
		description: "Double down in your current blackjack hand",
		handler: async (int: ChatInputCommandInteraction) => {
			const response = await doubleDown(int.guild.id, int.user.id);
			await int.reply(response);
		}
	}
};

const doubleDown = async (server_id: string, user_id: string) => {
	const data = await Api.post<BlackJackGameResponse>("gamble/blackjack/hit", {
		server_id,
		user_id,
		double_down: true
	});
	return buildBlackjackResponse(data, user_id);
};
