import type { Message } from "discord.js";

import type { IStock } from "btbot-types";
import type { ICommand } from "../types";
import { Api, Embed, getTrendEmoji, pluralIfNotOne, plusSignIfNotNegative } from "../helpers";

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
		let net = 0;
		stocks.map((stock) => {
			const amountDiff = stock.amount_worth - stock.amount;
			net += amountDiff;
			const priceDiff = stock.price_current - stock.price_bought;

			output += `**${stock.symbol}** ${getTrendEmoji(amountDiff)}\n`;

			output += `Net Gain/Loss: \`${plusSignIfNotNegative(
				amountDiff
			)}${amountDiff} BillyBuck${pluralIfNotOne(
				Math.abs(amountDiff)
			)} (${plusSignIfNotNegative(priceDiff)}${(
				(priceDiff * 100) /
				stock.price_bought
			).toFixed(2)}%)\`\n`;

			output += `Amount Invested: \`${stock.amount} BillyBuck${pluralIfNotOne(
				stock.amount
			)}\`\n`;

			output += `Current Value: \`${stock.amount_worth} BillyBuck${pluralIfNotOne(
				stock.amount_worth
			)}\`\n`;

			output += `Avg Price Bought At: \`${stock.price_bought} ${stock.currency}\`\n`;

			output += `Current Price: \`${stock.price_current} ${stock.currency}\`\n\n`;
		});
		output += `Uninvested Cash: \`${bucks} BillyBuck${pluralIfNotOne(bucks)}\``;

		const embed = Embed.success(output, `Stock Portfolio ${getTrendEmoji(net)}`);
		msg.channel.send({ embeds: [embed] });
		return;
	}
};
