import type { Message } from "discord.js";

import type { IStock } from "btbot-types";
import type { ICommand } from "../types";
import { Api, Embed, pluralIfNotOne } from "../helpers";

interface IStockBuy extends IStock {
	add_on: boolean;
	bucks: number;
}

export const buyStockCommand: ICommand = {
	prefix: /.*!buystock.*/gim,
	command: "!buystock",
	description:
		"Buy stock in the given ticker symbol for the specified amount of BillyBucks. Usage: `!buystock [tickerSymbol] [amount]`",
	handler: async (msg: Message) => {
		const args = msg.content.slice("!buystock".length).trim().split(" ");
		const symbol = args[0].toUpperCase();
		const amount = args[1];
		const res = await Api.post<IStockBuy>("stocks/buy", {
			server_id: msg.guild.id,
			user_id: msg.author.id,
			symbol: symbol,
			amount: amount
		});

		let output = "";
		output += `You invested ${res.add_on ? "an additional" : ""} \`${res.amount} BillyBuck${
			res.amount === 1 ? "" : "s"
		}\` in \`${res.symbol}\` at \`${res.price} ${res.currency}\`!\n\n`;
		output += `You now have ${res.bucks} BillyBuck${pluralIfNotOne(res.bucks)}.`;

		const embed = Embed.success(msg, output, "Stock Purchased 🚀");
		msg.channel.send(embed);
		return;
	}
};
