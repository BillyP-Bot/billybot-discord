import type { Message } from "discord.js";

import type { IStock } from "btbot-types";
import type { ICommand } from "../types";
import { Api, Embed, getTrendEmoji, pluralIfNotOne, plusSignIfNotNegative } from "../helpers";

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
		const res = await Api.post<IStockSell>("stocks/sell", {
			server_id: msg.guild.id,
			user_id: msg.author.id,
			symbol: symbol
		});

		let output = "";
		output += `You sold your stock in \`${res.symbol}\` at \`${res.price} ${
			res.currency
		}\` for \`${res.amount} BillyBuck${pluralIfNotOne(res.amount)}\`!\n\n`;
		output += `Net Gain/Loss: \`${plusSignIfNotNegative(res.delta)}${
			res.delta
		} BillyBuck${pluralIfNotOne(res.delta)}\` ${getTrendEmoji(res.delta)}\n\n`;
		output += `You now have ${res.bucks} BillyBucks.`;

		const embed = Embed.success(output, "Stock Sold 💰");
		msg.channel.send(embed);
		return;
	}
};
