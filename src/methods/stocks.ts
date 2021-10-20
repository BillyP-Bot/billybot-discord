import { Message } from "discord.js";

import { replyWithSuccessEmbed, replyWithErrorEmbed } from "./messages";

const yahooStockAPI = require("yahoo-stock-prices");

/*
	!stock
*/
export const getPrice = async (msg: Message, prefix: string): Promise<void> => {
	try {
		const args: string[] = msg.content.slice(prefix.length).trim().split(" ");
		if (args[0] === "") throw "Ticker symbol required! Usage: ```!stock [tickerSymbol]```";
		const symbol: string = args[0].toUpperCase();

		try {
			const stockData = await yahooStockAPI.getCurrentData(symbol);
			if (!stockData) throw `Cannot find current stock price for ticker symbol: '${symbol}'!`;

			replyWithSuccessEmbed(msg, symbol, `${stockData.price} (${stockData.currency})`);
		} catch (error) {
			throw `Cannot find current stock price for ticker symbol: '${symbol}'!`;
		}
	} catch (error) {
		replyWithErrorEmbed(msg, error);
	}
};

/*
	!buystock
*/

/*
	!sellstock
*/

/*
	!portfolio
*/