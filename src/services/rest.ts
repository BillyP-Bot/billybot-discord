import axios, { AxiosRequestConfig, AxiosResponse } from "axios";

import { config } from "../helpers/config";

export class Rest {

	private static readonly BackendClient = axios.create({
		baseURL: "https://btbackend.herokuapp.com/api/",
		headers: {
			"Content-Type": "application/json",
			"appcode": config.BACKEND_TOKEN
		}
	});

	public static async Post(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<any>> {
		return await Rest.BackendClient.post(url, data, config);
	}
}

export class StockApi {

	private static readonly base = "https://finance.yahoo.com/quote";

	private static readonly client = axios.create({
		baseURL: StockApi.base
	});

	public static async GetCurrentData(ticker: string): Promise<{ price: number, currency: string | null }> {
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

export class BtBackend {

	public static readonly Client = axios.create({
		baseURL: config.BT_BOT_API_ENDPOINT,
		headers: {
			"Content-Type": "application/json",
			"Authorization": `Bearer ${config.BT_BOT_AUTH_TOKEN}`,
			"x-api-key": config.BT_BOT_X_API_TOKEN
		}
	});
}