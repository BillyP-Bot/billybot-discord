import { User } from "../models/User";
import { Stock } from "../models/Stock";

export class StockRepository {
	public static async FindStocksForUser(serverId: string, user: User): Promise<Stock[]> {
		try {
			return await Stock.find({ serverId, user });
		} catch (e) {
			throw Error(e);
		}
	}

	public static async FindStockForUserBySymbol(serverId: string, user: User, tickerSymbol: string): Promise<Stock> {
		try {
			return await Stock.findOne({ serverId, user, tickerSymbol });
		} catch (e) {
			throw Error(e);
		}
	}

	public static async InsertOne(serverId: string, user: User, tickerSymbol: string, billyBucksInvested: number, boughtAtPrice: number): Promise<Stock> {
		try {
			const newStock = new Stock();
			newStock.serverId = serverId;
			newStock.user = user;
			newStock.tickerSymbol = tickerSymbol;
			newStock.billyBucksInvested = billyBucksInvested;
			newStock.boughtAtPrice = boughtAtPrice;

			user.stocks.push(newStock);

			await user.save();
			return await newStock.save();
		} catch (e) {
			throw Error(e);
		}
	}

	public static async UpdateOne(stock: Stock): Promise<boolean> {
		try {
			let updated;
			if (stock) updated = await stock.save();
			if (updated) return true;
		} catch (e) {
			throw Error(e);
		}
	}

	public static async RemoveOne(stock: Stock, user: User): Promise<Stock> {
		try {
			user.stocks.splice(user.stocks.indexOf(stock), 1);
			await user.save();
			return await stock.remove();
		} catch (e) {
			throw Error(e);
		}
	}
}