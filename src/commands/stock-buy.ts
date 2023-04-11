import type { ChatInputCommandInteraction } from "discord.js";
import { ApplicationCommandOptionType } from "discord.js";

import { Api, Embed, getInteractionOptionValue } from "../helpers";
import { CommandNames } from "../types/enums";

import type { IStock } from "btbot-types";
import type { ISlashCommand } from "../types";

interface IStockBuy extends IStock {
	add_on: boolean;
	bucks: number;
}

export const buyStockCommand: ISlashCommand = {
	name: CommandNames.buystock,
	description: "Buy stock in the given ticker symbol for the specified number of BillyBucks",
	options: [
		{
			name: "symbol",
			description: "The ticker symbol of the stock to buy",
			type: ApplicationCommandOptionType.String,
			required: true
		},
		{
			name: "amount",
			description: "The number of BillyBucks to invest",
			type: ApplicationCommandOptionType.Integer,
			required: true,
			min_value: 1
		}
	],
	handler: async (int: ChatInputCommandInteraction) => {
		await int.deferReply();
		const symbol = getInteractionOptionValue<string>("symbol", int);
		const amount = getInteractionOptionValue<number>("amount", int);
		const embed = await buyStock(int.guild.id, int.user.id, symbol, amount);
		await int.editReply({ embeds: [embed] });
	}
};

const buyStock = async (server_id: string, user_id: string, symbol: string, amount: number) => {
	const res = await Api.post<IStockBuy>("stocks/buy", {
		server_id,
		user_id,
		symbol,
		amount
	});
	let output = "";
	output += `You invested ${res.add_on ? "an additional" : ""} \`${res.amount} BillyBuck${
		res.amount === 1 ? "" : "s"
	}\` in \`${res.symbol}\` at \`${res.price} ${res.currency}\`!\n\n`;
	output += `You now have ${res.bucks} BillyBucks.`;
	return Embed.success(output, "Stock Purchased 🚀");
};
