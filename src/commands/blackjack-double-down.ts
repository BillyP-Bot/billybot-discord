import type { ChatInputCommandInteraction, MessageReaction } from "discord.js";

import type { BlackJackGameResponse, ISlashCommand } from "../types";
import { Api, buildBlackjackResponse } from "../helpers";
import { CommandNames } from "../types/enums";

export const blackjackDoubleDownCommand: ISlashCommand = {
	name: CommandNames.doubledown,
	description: "Double down in your current blackjack hand",
	handler: async (int: ChatInputCommandInteraction) => {
		await int.deferReply();
		const response = await doubleDown(int.guild.id, int.user.id);
		await int.editReply(response);
	},
	reactHandler: async (react: MessageReaction, sender_id: string) => {
		const response = await doubleDown(react.message.guild.id, sender_id);
		await react.message.channel.send(response);
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
