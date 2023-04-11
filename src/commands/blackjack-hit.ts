import type { ChatInputCommandInteraction, MessageReaction } from "discord.js";

import { Api, buildBlackjackResponse } from "../helpers";
import { CommandNames } from "../types/enums";

import type { BlackJackGameResponse, DiscordChannel, ISlashCommand } from "../types";

export const blackjackHitCommand: ISlashCommand = {
	name: CommandNames.hit,
	description: "Hit in your current blackjack hand",
	handler: async (int: ChatInputCommandInteraction) => {
		await int.deferReply();
		const data = await Api.post<BlackJackGameResponse>("gamble/blackjack/hit", {
			server_id: int.guild.id,
			user_id: int.user.id,
			double_down: false
		});
		const response = buildBlackjackResponse(data, int.user.id);
		const replyInt = await int.editReply(response);
		if (!data.is_complete) {
			const replyMsg = await replyInt.fetch();
			await Promise.all([replyMsg.react("🟩"), replyMsg.react("🟨")]);
		}
	},
	reactHandler: async (react: MessageReaction, sender_id: string) => {
		await hit(react.message.guild.id, sender_id, react.message.channel);
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
