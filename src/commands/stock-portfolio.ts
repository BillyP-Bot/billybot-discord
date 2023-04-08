import type { ChatInputCommandInteraction } from "discord.js";

import type { IStock } from "btbot-types";
import type { ISlashCommand } from "../types";
import { Api, Embed, getTrendEmoji, pluralIfNotOne, plusSignIfNotNegative } from "../helpers";
import { CommandNames } from "../types/enums";

interface IPortfolio {
	stocks: IPortfolioStock[];
	bucks: number;
}

interface IPortfolioStock extends IStock {
	price_bought: number;
	price_current: number;
	amount_worth: number;
}

export const portfolioCommand: ISlashCommand = {
	name: CommandNames.portfolio,
	description: "View info on your active investments",
	handler: async (int: ChatInputCommandInteraction) => {
		const embed = await portfolio(int.guild.id, int.user.id);
		await int.reply({ embeds: [embed] });
	}
};

const portfolio = async (server_id: string, user_id: string) => {
	const res = await Api.post<IPortfolio>("stocks/portfolio", {
		server_id,
		user_id
	});
	const { stocks, bucks } = res;
	let output = "";
	let net = 0;
	stocks.forEach(({ amount_worth, amount, price_current, price_bought, symbol, currency }) => {
		const amountDiff = amount_worth - amount;
		net += amountDiff;
		const priceDiff = price_current - price_bought;
		output += `**${symbol}** ${getTrendEmoji(amountDiff)}\n`;
		output += `Net Gain/Loss: \`${plusSignIfNotNegative(
			amountDiff
		)}${amountDiff} BillyBuck${pluralIfNotOne(Math.abs(amountDiff))} (${plusSignIfNotNegative(
			priceDiff
		)}${((priceDiff * 100) / price_bought).toFixed(2)}%)\`\n`;
		output += `Amount Invested: \`${amount} BillyBuck${pluralIfNotOne(amount)}\`\n`;
		output += `Current Value: \`${amount_worth} BillyBuck${pluralIfNotOne(amount_worth)}\`\n`;
		output += `Avg Price Bought At: \`${price_bought} ${currency}\`\n`;
		output += `Current Price: \`${price_current} ${currency}\`\n\n`;
	});
	output += `Uninvested Cash: \`${bucks} BillyBuck${pluralIfNotOne(bucks)}\``;
	return Embed.success(
		output,
		`Stock Portfolio ${getTrendEmoji(net)} \`${plusSignIfNotNegative(
			net
		)}${net} BillyBuck${pluralIfNotOne(net)}\``
	);
};
