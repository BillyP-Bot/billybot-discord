import type { Message } from "discord.js";

import type { IStock } from "btbot-types";
import type { ICommand } from "../types";
import { Api, Embed } from "../helpers";

interface IPortfolio {
	stocks: IPortfolioStock[];
	bucks: number;
}

interface IPortfolioStock extends IStock {
	price_bought: number;
	price_current: number;
	amount_worth: number;
}

export const portfolioCommand: ICommand = {
	prefix: /.*!portfolio.*/gim,
	command: "!portfolio",
	description: "View info on your active investments.",
	handler: async (msg: Message) => {
		const res = await Api.post<IPortfolio>("stocks/portfolio", {
			server_id: msg.guild.id,
			user_id: msg.author.id
		});
		const { stocks, bucks } = res;

		let output = "";
		for (const stock of stocks) {
			const amountDiff = stock.amount_worth - stock.amount;
			const priceDiff = stock.price_current - stock.price_bought;
			output += `**${stock.symbol}**\n`;
			output += `Net Gain/Loss: ${amountDiff >= 0 ? "+" : ""}${amountDiff} BillyBucks (${
				priceDiff >= 0 ? "+" : ""
			}${(priceDiff / stock.price_bought).toFixed(2)}%)\n`;
			output += `Amount Invested: ${stock.amount} BillyBucks\n`;
			output += `Current Value: ${stock.amount_worth} BillyBucks\n`;
			output += `Avg Price Bought At: ${stock.price_bought} ${stock.currency}\n`;
			output += `Current Price: ${stock.price_current} ${stock.currency}\n\n`;
		}
		output += `Uninvested Cash: ${bucks} BillyBucks`;

		const embed = Embed.success(msg, output, "Stock Portfolio");
		msg.channel.send(embed);
		return;
	}
};
