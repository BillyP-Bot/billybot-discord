import { ApplicationCommandOptionType, type ChatInputCommandInteraction } from "discord.js";

import { CommandNames } from "@enums";
import { Api, Embed, buildBlackjackResponse, getInteractionOptionValue } from "@helpers";
import type { BlackJackGameResponse, ISlashCommand } from "@types";

export const blackjackCommand: ISlashCommand = {
	name: CommandNames.blackjack,
	description: "Play a hand of blackjack",
	options: [
		{
			name: "bet",
			description: "The number of BillyBucks to bet",
			type: ApplicationCommandOptionType.Integer,
			required: true,
			min_value: 10
		}
	],
	handler: async (int: ChatInputCommandInteraction) => {
		await int.deferReply();
		const bet = getInteractionOptionValue<number>("bet", int);
		const { embed, is_complete } = await blackjack(int.guild.id, int.user.id, bet);
		const replyInt = await int.editReply({ embeds: [embed] });
		if (!is_complete) {
			const replyMsg = await replyInt.fetch();
			await Promise.all([replyMsg.react("🟩"), replyMsg.react("🟨"), replyMsg.react("🟦")]);
		}
	}
};

const blackjack = async (server_id: string, user_id: string, wager: number) => {
	const data = await Api.post<BlackJackGameResponse>("gamble/blackjack", {
		server_id,
		user_id,
		wager
	});
	const response = buildBlackjackResponse(data, user_id);
	return { embed: Embed.success(response), is_complete: data.is_complete };
};
