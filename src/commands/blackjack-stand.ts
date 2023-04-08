import type { ChatInputCommandInteraction, Message, MessageReaction } from "discord.js";

import type { BlackJackGameResponse, ICommand } from "../types";
import { Api, buildBlackjackResponse } from "../helpers";

export const blackjackStandCommand: ICommand = {
	prefix: /.*!stand.*/gim,
	command: "!stand",
	description: "Stand in your current blackjack hand",
	handler: async (msg: Message) => {
		const response = await stand(msg.guild.id, msg.author.id);
		msg.channel.send(response);
	},
	reactHandler: async (react: MessageReaction, sender_id: string) => {
		const response = await stand(react.message.guild.id, sender_id);
		react.message.channel.send(response);
	},
	slash: {
		name: "stand",
		description: "Stand in your current blackjack hand",
		handler: async (int: ChatInputCommandInteraction) => {
			const response = await stand(int.guild.id, int.user.id);
			await int.reply(response);
		}
	}
};

const stand = async (server_id: string, user_id: string) => {
	const data = await Api.post<BlackJackGameResponse>("gamble/blackjack/stand", {
		server_id,
		user_id
	});
	return buildBlackjackResponse(data, user_id);
};
