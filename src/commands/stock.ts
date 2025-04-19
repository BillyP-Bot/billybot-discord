import type { IStock } from "btbot-types";
import { ApplicationCommandOptionType, type ChatInputCommandInteraction } from "discord.js";

import { CommandNames } from "@enums";
import { Api, Embed, getInteractionOptionValue } from "@helpers";
import type { ISlashCommand } from "@types";

export const stockCommand: ISlashCommand = {
	name: CommandNames.stock,
	description: "Look up the price of the given stock",
	options: [
		{
			name: "symbol",
			description: "The ticker symbol of the stock to look up",
			type: ApplicationCommandOptionType.String,
			required: true
		}
	],
	handler: async (int: ChatInputCommandInteraction) => {
		await int.deferReply();
		const symbol = getInteractionOptionValue<string>("symbol", int);
		const embed = await stock(symbol);
		await int.editReply({ embeds: [embed] });
	}
};

const stock = async (symbol: string) => {
	const res = await Api.get<IStock>(`stocks/price?symbol=${symbol}`);
	return Embed.success(`\`${res.price} ${res.currency}\``, res.symbol);
};
