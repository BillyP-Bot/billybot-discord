import type { ChatInputCommandInteraction } from "discord.js";
import { ApplicationCommandOptionType } from "discord.js";

import { Api, buildBlackjackResponse, getInteractionOptionValue } from "../helpers";
import { CommandNames } from "../types/enums";

import type { BlackJackGameResponse, ISlashCommand } from "../types";
export const blackjackCommand: ISlashCommand = {
	name: CommandNames.blackjack,
	description: "Play a hand of blackjack",
	options: [
		{
			name: "bet",
			description: "The number of BillyBucks to bet",
			type: ApplicationCommandOptionType.Integer,
			required: true,
			minValue: 10
		}
	],
	handler: async (int: ChatInputCommandInteraction) => {
		await int.deferReply();
		const bet = getInteractionOptionValue<number>("bet", int);
		if (bet < 10) throw "Bet amount must be at least 10 BillyBucks!";
		const { response, is_complete } = await blackjack(int.guild.id, int.user.id, bet);
		const replyInt = await int.editReply(response);
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
	return { response: buildBlackjackResponse(data, user_id), is_complete: data.is_complete };
};
