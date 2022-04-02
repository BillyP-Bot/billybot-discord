import axios, { AxiosRequestConfig, AxiosResponse } from "axios";

import { Config } from "../helpers";

export class Rest {

	private static readonly BackendClient = axios.create({
		baseURL: "https://btbackend.herokuapp.com/api/",
		headers: {
			"Content-Type": "application/json",
			"appcode": Config.BACKEND_TOKEN
		}
	});

	public static async PostToBackend(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<any>> {
		try {
			return await Rest.BackendClient.post(url, data, config);
		} catch (error) {
			throw new Error(error);
		}
	}

	private static readonly StockClient = axios.create({
		baseURL: "https://finance.yahoo.com/quote"
	});

	public static async GetCurrentStockData(ticker: string): Promise<{ price: number, currency: string }> {
		const symbol = ticker.toUpperCase().trim();
		const { data } = await Rest.StockClient.get(symbol);

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