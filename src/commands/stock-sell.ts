import type { Message } from "discord.js";

import type { IStock } from "btbot-types";
import type { ICommand } from "../types";
import { Api, Embed } from "../helpers";

export const sellStockCommand: ICommand = {
	prefix: /.*!sellstock.*/gim,
	command: "!sellstock",
	description:
		"Sell all stock you own in the given ticker symbol. Usage: `!sellstock [tickerSymbol]`",
	handler: async (msg: Message) => {
		const args = msg.content.slice("!sellstock".length).trim().split(" ");
		const symbol = args[0].toUpperCase();
		const res = await Api.post<IStock>("stocks/sell", {
			server_id: msg.guild.id,
			user_id: msg.author.id,
			symbol: symbol
		});
		const embed = Embed.success(
			msg,
			`You sold your stock in '${res.symbol}' at ${res.price} ${res.currency} for ${
				res.amount
			} BillyBuck${res.amount === 1 ? "" : "s"}!`,
			"Stock Sold"
		);
		msg.channel.send(embed);
		return;
	}
};
