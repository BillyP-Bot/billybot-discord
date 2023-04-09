import type { ChatInputCommandInteraction } from "discord.js";
import { ApplicationCommandOptionType } from "discord.js";

import { Api, buildBlackjackResponse, getInteractionOptionValue } from "../helpers";
import { CommandNames } from "../types/enums";

import type { BlackJackGameResponse, ISlashCommand } from "../types";
export const blackjackCommand: ISlashCommand = {
	name: CommandNames.blackjack,
	description: "Let's play blackjack",
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
		const data = await Api.post<BlackJackGameResponse>("gamble/blackjack", {
			server_id: int.guild.id,
			user_id: int.user.id,
			wager: bet
		});
		const response = buildBlackjackResponse(data, int.user.id);
		const replyInt = await int.editReply(response);
		if (!data.is_complete) {
			const replyMsg = await replyInt.fetch();
			await Promise.all([replyMsg.react("🟩"), replyMsg.react("🟨"), replyMsg.react("🟦")]);
		}
	}
};
