// import { Baseball } from "../models/Baseball";
// import { User } from "../models/User";

// export class BaseballRepository {

// 	public static async FindActiveGameForUser(user: User, serverId: string, awayOnly?: boolean): Promise<Baseball> {
// 		try {
// 			let game = await Baseball.findOne({ serverId, awayTeam: user, gameOver: false }, { relations: ["awayTeam", "homeTeam"] });
// 			if (!game && !awayOnly) game = await Baseball.findOne({ serverId, homeTeam: user, gameOver: false }, { relations: ["awayTeam", "homeTeam"] });
// 			return game;
// 		} catch (e) {
// 			throw Error(e);
// 		}
// 	}

// 	public static async InsertOne(serverId: string, awayTeam: User, homeTeam: User, wager: number): Promise<Baseball> {
// 		try {
// 			const newGame = new Baseball();
// 			newGame.serverId = serverId;
// 			newGame.awayTeam = awayTeam;
// 			newGame.homeTeam = homeTeam;
// 			newGame.wager = wager;

// 			awayTeam.awayGames.push(newGame);
// 			homeTeam.homeGames.push(newGame);

// 			await awayTeam.save();
// 			await homeTeam.save();
// 			await newGame.save();
// 			return newGame;
// 		} catch (e) {
// 			throw Error(e);
// 		}
// 	}

// 	public static async UpdateOne(game: Baseball): Promise<Baseball> {
// 		try {
// 			return await game.save();
// 		} catch (e) {
// 			throw Error(e);
// 		}
// 	}

// 	public static async UpdateHomeTeamAndWager(game: Baseball, newHomeTeam: User, wager: number): Promise<boolean> {
// 		try {
// 			const existingHomeTeam = game.homeTeam;
// 			existingHomeTeam.homeGames.splice(existingHomeTeam.homeGames.indexOf(game), 1);

// 			newHomeTeam.homeGames.push(game);
// 			game.homeTeam = newHomeTeam;
// 			game.wager = wager;
			
// 			await existingHomeTeam.save();
// 			await newHomeTeam.save();
// 			await game.save();
// 			return true;
// 		} catch (e) {
// 			throw Error(e);
// 		}
// 	}

// 	public static async RemoveOne(game: Baseball, winnerUserId?: string): Promise<boolean> {
// 		try {
// 			game.awayTeam.awayGames.splice(game.awayTeam.awayGames.indexOf(game), 1);
// 			game.homeTeam.homeGames.splice(game.homeTeam.homeGames.indexOf(game), 1);

// 			game.awayTeam.inBaseballGame = false;
// 			game.homeTeam.inBaseballGame = false;

// 			if (winnerUserId) {
// 				if (game.awayTeam.userId === winnerUserId) {
// 					game.awayTeam.baseballWins++;
// 					game.homeTeam.baseballLosses++;
// 					game.awayTeam.billyBucks += (2 * game.wager);
// 				} else {
// 					game.awayTeam.baseballLosses++;
// 					game.homeTeam.baseballWins++;
// 					game.homeTeam.billyBucks += (2 * game.wager);
// 				}
// 			}

// 			await game.awayTeam.save();
// 			await game.homeTeam.save();
// 			await game.remove();
// 			return true;
// 		} catch (e) {
// 			throw Error(e);
// 		}
// 	}
// }