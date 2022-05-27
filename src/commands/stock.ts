import type { Message } from "discord.js";

import type { IStock } from "btbot-types";
import type { ICommand } from "../types";
import { Api, Embed } from "../helpers";

export const stockCommand: ICommand = {
	prefix: /.*!stock.*/gim,
	command: "!stock",
	description: "Look up the price of the given stock. Usage: `!stock [tickerSymbol]`",
	handler: async (msg: Message) => {
		const args = msg.content.slice("!stock".length).trim().split(" ");
		const symbol = args[0];
		const res = await Api.get<IStock>(`stocks/price?symbol=${symbol}`);
		const embed = Embed.success(`\`${res.price} ${res.currency}\``, res.symbol);
		msg.channel.send(embed);
		return;
	}
};
