import type { ChatInputCommandInteraction, MessageReaction } from "discord.js";

import type { BlackJackGameResponse, ISlashCommand } from "../types";
import { Api, buildBlackjackResponse } from "../helpers";
import { CommandNames } from "../types/enums";

export const blackjackStandCommand: ISlashCommand = {
	name: CommandNames.stand,
	description: "Stand in your current blackjack hand",
	handler: async (int: ChatInputCommandInteraction) => {
		await int.deferReply();
		const response = await stand(int.guild.id, int.user.id);
		await int.editReply(response);
	},
	reactHandler: async (react: MessageReaction, sender_id: string) => {
		const response = await stand(react.message.guild.id, sender_id);
		await react.message.channel.send(response);
	}
};

const stand = async (server_id: string, user_id: string) => {
	const data = await Api.post<BlackJackGameResponse>("gamble/blackjack/stand", {
		server_id,
		user_id
	});
	return buildBlackjackResponse(data, user_id);
};
