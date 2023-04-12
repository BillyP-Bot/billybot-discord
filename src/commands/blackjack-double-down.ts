import type { ChatInputCommandInteraction, MessageReaction } from "discord.js";

import type { BlackJackGameResponse, ISlashCommand } from "../types";
import { Api, buildBlackjackResponse, Embed } from "../helpers";
import { CommandNames } from "../types/enums";

export const blackjackDoubleDownCommand: ISlashCommand = {
	name: CommandNames.doubledown,
	description: "Double down in your current blackjack hand",
	handler: async (int: ChatInputCommandInteraction) => {
		await int.deferReply();
		const embed = await doubleDown(int.guild.id, int.user.id);
		await int.editReply({ embeds: [embed] });
	},
	reactHandler: async (react: MessageReaction, sender_id: string) => {
		const embed = await doubleDown(react.message.guild.id, sender_id);
		await react.message.channel.send({ embeds: [embed] });
	}
};

const doubleDown = async (server_id: string, user_id: string) => {
	const data = await Api.post<BlackJackGameResponse>("gamble/blackjack/hit", {
		server_id,
		user_id,
		double_down: true
	});
	const response = buildBlackjackResponse(data, user_id);
	return Embed.success(response);
};
