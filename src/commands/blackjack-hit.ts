import type { ChatInputCommandInteraction, MessageReaction } from "discord.js";

import { Api, buildBlackjackResponse, Embed } from "../helpers";
import { CommandNames } from "../types/enums";

import type { BlackJackGameResponse, ISlashCommand } from "../types";

export const blackjackHitCommand: ISlashCommand = {
	name: CommandNames.hit,
	description: "Hit in your current blackjack hand",
	handler: async (int: ChatInputCommandInteraction) => {
		await int.deferReply();
		const { embed, is_complete } = await hit(int.guild.id, int.user.id);
		const replyInt = await int.editReply({ embeds: [embed] });
		if (!is_complete) {
			const replyMsg = await replyInt.fetch();
			await Promise.all([replyMsg.react("🟩"), replyMsg.react("🟨")]);
		}
	},
	reactHandler: async (react: MessageReaction, sender_id: string) => {
		const { embed, is_complete } = await hit(react.message.guild.id, sender_id);
		const replyMsg = await react.message.channel.send({ embeds: [embed] });
		if (!is_complete) await Promise.all([replyMsg.react("🟩"), replyMsg.react("🟨")]);
	}
};

const hit = async (server_id: string, user_id: string) => {
	const data = await Api.post<BlackJackGameResponse>("gamble/blackjack/hit", {
		server_id,
		user_id,
		double_down: false
	});
	const response = buildBlackjackResponse(data, user_id);
	return { embed: Embed.success(response), is_complete: data.is_complete };
};
