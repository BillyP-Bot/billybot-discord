import { ApplicationCommandOptionType, ChatInputCommandInteraction, Message } from "discord.js";

import { Api, Embed, getInteractionOptionValue } from "../helpers";

import type { IStock } from "btbot-types";
import type { ICommand } from "../types";
export const stockCommand: ICommand = {
	prefix: /.*!stock.*/gim,
	command: "!stock",
	description: "Look up the price of the given stock. Usage: `!stock [tickerSymbol]`",
	handler: async (msg: Message) => {
		const args = msg.content.slice("!stock".length).trim().split(" ");
		const embed = await stock(args[0]);
		await msg.channel.send({ embeds: [embed] });
	},
	slash: {
		name: "stock",
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
			const symbol = getInteractionOptionValue<string>("symbol", int);
			const embed = await stock(symbol);
			await int.reply({ embeds: [embed] });
		}
	}
};

const stock = async (symbol: string) => {
	const res = await Api.get<IStock>(`stocks/price?symbol=${symbol}`);
	return Embed.success(`\`${res.price} ${res.currency}\``, res.symbol);
};
