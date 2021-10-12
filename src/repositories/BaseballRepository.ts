import { Baseball } from "../models/Baseball";
import { User } from "../models/User";
import { UserRepository as UserRepo } from "../repositories/UserRepository";

export class BaseballRepository {

	public static async FindActiveGameForUser(user: User, serverId: string, awayOnly?: boolean): Promise<Baseball> {
		try {
			let game = await Baseball.findOne({ serverId, awayTeam: user, gameOver: false }, { relations: ["awayTeam", "homeTeam"] });
			if (!game && !awayOnly) game = await Baseball.findOne({ serverId, homeTeam: user, gameOver: false }, { relations: ["awayTeam", "homeTeam"] });
			return game;
		} catch (e) {
			throw Error(e);
		}
	}

	public static async InsertOne(serverId: string, awayTeam: User, homeTeam: User): Promise<Baseball> {
		try {
			const newGame = new Baseball();
			newGame.serverId = serverId;
			newGame.awayTeam = awayTeam;
			newGame.homeTeam = homeTeam;

			awayTeam.awayGames.push(newGame);
			homeTeam.homeGames.push(newGame);

			await awayTeam.save();
			await homeTeam.save();
			await newGame.save();
			return newGame;
		} catch (e) {
			throw Error(e);
		}
	}

	public static async UpdateOne(game: Baseball): Promise<Baseball> {
		try {
			return await game.save();
		} catch (e) {
			throw Error(e);
		}
	}

	public static async UpdateHomeTeam(game: Baseball, newHomeTeam: User): Promise<boolean> {
		try {
			const existingHomeTeam = await UserRepo.FindOne(game.homeTeam.userId, game.serverId);
			if (existingHomeTeam) {
				const index = existingHomeTeam.homeGames.indexOf(game);
				existingHomeTeam.homeGames.splice(index, 1);
			}
			
			newHomeTeam.homeGames.push(game);
			game.homeTeam = newHomeTeam;
			
			await existingHomeTeam.save();
			await newHomeTeam.save();
			await game.save();
			return true;
		} catch (e) {
			throw Error(e);
		}
	}
}