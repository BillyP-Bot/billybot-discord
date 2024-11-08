import { ChatInputCommandInteraction, MessageReaction } from "discord.js";

import { Colors, CommandNames } from "@enums";
import { Api, buildBlackjackResponse, Embed } from "@helpers";
import { BlackJackGameResponse, ISlashCommand } from "@types";

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
	const color = !data.won && data.is_complete ? Colors.red : Colors.green;
	return { embed: Embed.success(response, null, color), is_complete: data.is_complete };
};
