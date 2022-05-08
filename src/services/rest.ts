import axios from "axios";
import { create } from "apisauce";

import { config } from "../helpers/config";

export class StockApi {

	private static readonly base = "https://finance.yahoo.com/quote";

	private static readonly client = axios.create({
		baseURL: StockApi.base
	});

	public static async GetCurrentData(ticker: string): Promise<{ price: number, currency: string }> {
		const symbol = ticker.toUpperCase().trim();
		const { data } = await StockApi.client.get(symbol);

		let price: string = data.split(`"${symbol}":{"sourceInterval"`)[1]
			.split("regularMarketPrice")[1]
			.split("fmt\":\"")[1]
			.split("\"")[0];

		price = price.replace(",", "");

		const currencyMatch = data.match(/Currency in ([A-Za-z]{3})/);
		let currency = null;
		if (currencyMatch) {
			currency = currencyMatch[1];
		}

		return { price: parseFloat(price), currency };
	}
}

export class Api {

	public static readonly client = create({
		baseURL: config.BILLY_BACKEND,
		headers: {
			"Authorization": `Bearer ${config.BILLY_BACKEND_TOKEN}`,
			"x-api-timestamp": null
		}
	})
}

Api.client.axiosInstance.interceptors.request.use((config) => {
	config.headers["x-api-timestamp"] = new Date().getTime();
	return config;
});