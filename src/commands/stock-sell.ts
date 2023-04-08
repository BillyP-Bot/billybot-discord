import type { ChatInputCommandInteraction, Message } from "discord.js";
import { ApplicationCommandOptionType } from "discord.js";

import {
	Api,
	Embed,
	getInteractionOptionValue,
	getTrendEmoji,
	pluralIfNotOne,
	plusSignIfNotNegative
} from "../helpers";

import type { IStock } from "btbot-types";
import type { ICommand } from "../types";
interface IStockSell extends IStock {
	delta: number;
	bucks: number;
}

export const sellStockCommand: ICommand = {
	prefix: /.*!sellstock.*/gim,
	command: "!sellstock",
	description:
		"Sell all stock you own in the given ticker symbol. Usage: `!sellstock [tickerSymbol]`",
	handler: async (msg: Message) => {
		const args = msg.content.slice("!sellstock".length).trim().split(" ");
		const symbol = args[0].toUpperCase();
		const embed = await sellStock(msg.guild.id, msg.author.id, symbol);
		await msg.channel.send({ embeds: [embed] });
	},
	slash: {
		name: "sellstock",
		description: "Sell all stock you own in the given ticker symbol",
		options: [
			{
				name: "symbol",
				description: "The ticker symbol of the stock to sell",
				type: ApplicationCommandOptionType.String,
				required: true
			}
		],
		handler: async (int: ChatInputCommandInteraction) => {
			const symbol = getInteractionOptionValue<string>("symbol", int);
			const embed = await sellStock(int.guild.id, int.user.id, symbol);
			await int.reply({ embeds: [embed] });
		}
	}
};

const sellStock = async (server_id: string, user_id: string, symbol: string) => {
	const res = await Api.post<IStockSell>("stocks/sell", {
		server_id,
		user_id,
		symbol: symbol
	});
	let output = "";
	output += `You sold your stock in \`${res.symbol}\` at \`${res.price} ${res.currency}\` for \`${
		res.amount
	} BillyBuck${pluralIfNotOne(res.amount)}\`!\n\n`;
	output += `Net Gain/Loss: \`${plusSignIfNotNegative(res.delta)}${
		res.delta
	} BillyBuck${pluralIfNotOne(res.delta)}\` ${getTrendEmoji(res.delta)}\n\n`;
	output += `You now have ${res.bucks} BillyBucks.`;
	return Embed.success(output, "Stock Sold 💰");
};
