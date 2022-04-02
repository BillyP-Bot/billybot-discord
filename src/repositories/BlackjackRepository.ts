import { Blackjack, User } from "../models";

export class BlackjackRepository {

	public static async FindActiveHandForUser(user: User, serverId: string): Promise<Blackjack> {
		try {
			return await Blackjack.findOne({ serverId, user: user }, { relations: ["user"] });
		} catch (e) {
			throw Error(e);
		}
	}

	public static async InsertOne(serverId: string, user: User, wager: number, deck: string, playerHand: string, dealerHand: string): Promise<Blackjack> {
		try {
			const newHand = new Blackjack();
			newHand.serverId = serverId;
			newHand.user = user;
			newHand.wager = wager;
			newHand.deck = deck;
			newHand.playerHand = playerHand;
			newHand.dealerHand = dealerHand;
			newHand.latestMessageId = "N/A";

			user.blackjackHands.push(newHand);

			await user.save();
			await newHand.save();
			return newHand;
		} catch (e) {
			throw Error(e);
		}
	}

	public static async UpdateOne(hand: Blackjack): Promise<Blackjack> {
		try {
			return await hand.save();
		} catch (e) {
			throw Error(e);
		}
	}

	public static async RemoveOne(hand: Blackjack): Promise<boolean> {
		try {
			hand.user.blackjackHands.splice(hand.user.blackjackHands.indexOf(hand), 1);

			await hand.user.save();
			await hand.remove();
			return true;
		} catch (e) {
			throw Error(e);
		}
	}
}
