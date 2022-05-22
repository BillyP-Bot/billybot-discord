import type { Message, MessageReaction } from "discord.js";

import type { BlackJackGameResponse, DiscordChannel, ICommand } from "../types";
import { Api, buildBlackjackResponse } from "../helpers";

export const blackjackHitCommand: ICommand = {
	prefix: /.*!hit.*/gim,
	command: "!hit",
	description: "Hit in your current game of Blackjack",
	handler: async (msg: Message) => {
		return await hit(msg.guild.id, msg.author.id, msg.channel);
	},
	reactHandler: async (react: MessageReaction, sender_id: string) => {
		return await hit(react.message.guild.id, sender_id, react.message.channel);
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
	return;
};
