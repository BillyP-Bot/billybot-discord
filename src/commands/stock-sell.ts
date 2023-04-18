import { IStock } from "btbot-types";
import { ApplicationCommandOptionType, ChatInputCommandInteraction } from "discord.js";

import { CommandNames } from "@enums";
import {
	Api,
	Embed,
	getInteractionOptionValue,
	getTrendEmoji,
	pluralIfNotOne,
	plusSignIfNotNegative
} from "@helpers";
import { ISlashCommand } from "@types";

interface IStockSell extends IStock {
	delta: number;
	bucks: number;
}

export const sellStockCommand: ISlashCommand = {
	name: CommandNames.sellstock,
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
		await int.deferReply();
		const symbol = getInteractionOptionValue<string>("symbol", int);
		const embed = await sellStock(int.guild.id, int.user.id, symbol);
		await int.editReply({ embeds: [embed] });
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
