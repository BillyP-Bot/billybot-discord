import type { ChatInputCommandInteraction, Message, MessageReaction } from "discord.js";

import { Api, buildBlackjackResponse } from "../helpers";

import type { BlackJackGameResponse, DiscordChannel, ICommand } from "../types";

export const blackjackHitCommand: ICommand = {
	prefix: /.*!hit.*/gim,
	command: "!hit",
	description: "Hit in your current blackjack hand",
	handler: async (msg: Message) => {
		await hit(msg.guild.id, msg.author.id, msg.channel);
	},
	reactHandler: async (react: MessageReaction, sender_id: string) => {
		await hit(react.message.guild.id, sender_id, react.message.channel);
	},
	slash: {
		name: "hit",
		description: "Hit in your current blackjack hand",
		handler: async (int: ChatInputCommandInteraction) => {
			const data = await Api.post<BlackJackGameResponse>("gamble/blackjack/hit", {
				server_id: int.guild.id,
				user_id: int.user.id,
				double_down: false
			});
			const response = buildBlackjackResponse(data, int.user.id);
			const replyInt = await int.reply(response);
			if (!data.is_complete) {
				const replyMsg = await replyInt.fetch();
				await Promise.all([replyMsg.react("🟩"), replyMsg.react("🟨")]);
			}
		}
	}
};

const hit = async (server_id: string, user_id: string, channel: DiscordChannel) => {
	const data = await Api.post<BlackJackGameResponse>("gamble/blackjack/hit", {
		server_id,
		user_id,
		double_down: false
	});
	const response = buildBlackjackResponse(data, user_id);
	const message = await channel.send(response);
	if (!data.is_complete) await Promise.all([message.react("🟩"), message.react("🟨")]);
};
