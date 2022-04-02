import { DMChannel, Message, MessageReaction, NewsChannel, TextChannel } from "discord.js";

import { MessagesMethods } from "./messages";
import { Blackjack, User } from "../models";
import { BlackjackRepo, UserRepo } from "../repositories";
import { IBlackjackCount } from "../types";

export class BlackjackMethods {

	/*
		!blackjack [bet]
		when current user is not already in an active hand: initiate a new hand for the specified bet amount
	
		!blackjack
		when current user is already in an active hand: show the current state of the hand
	
		!blackjack help
		view info on blackjack commands
	*/
	static async Blackjack(msg: Message, prefix: string): Promise<void> {
		try {
			const args: string[] = msg.content.slice(prefix.length).trim().split(" ");
			if (args[0] === "") args.splice(0, 1);
			if (args.length > 1) throw "Invalid format! Expects 0 or 1 argument(s).";
	
			if (args[0] === "help") return MessagesMethods.ReplyWithSuccessEmbed(msg, "Blackjack Commands", BlackjackMethods.Help());
	
			const user = await UserRepo.FindOne(msg.author.id, msg.guild.id);
			const hand = await BlackjackRepo.FindActiveHandForUser(user, msg.guild.id);
	
			if (hand) {
				// show the current state of the hand
				const status: string = await BlackjackMethods.GetHandStatus(hand);
				const msgSent = await msg.channel.send(status);
				BlackjackMethods.ReactWithBlackjackOptions(msgSent, hand.playerHand.length === 4);
	
				hand.latestMessageId = msgSent.id;
				await BlackjackRepo.UpdateOne(hand);
			} else {
				// initiate a new hand for the specified bet amount
				const bet = parseInt(args[0]);
				if (isNaN(bet) || bet < 10) throw "No active blackjack hand found!\n\nMust bet at least 10 BillyBucks to play a hand of blackjack:\n\n`!blackjack [bet]`";
				if (bet > user.billyBucks) throw `Cannot bet ${bet} BillyBucks, you only have ${user.billyBucks}!`;
	
				await BlackjackMethods.StartNewHand(msg, user, bet);
			}
	
		} catch (error) {
			MessagesMethods.ReplyWithErrorEmbed(msg, error);
		}
	}
	
	/*
		!hit
		when current user is already in an active hand: deal the user one more card
	*/
	static async Hit(userId: string, serverId: string, channel: TextChannel | DMChannel | NewsChannel): Promise<void> {
		try {
			const user = await UserRepo.FindOne(userId, serverId);
			let hand = await BlackjackRepo.FindActiveHandForUser(user, serverId);
			if (!hand) throw "No active blackjack hand found!";
	
			const deck: Deck = new Deck(BlackjackMethods.UnStringifyCards(hand.deck));
			const playerCards: Card[] = BlackjackMethods.UnStringifyCards(hand.playerHand);
	
			playerCards.push(deck.deal());
	
			hand.deck = BlackjackMethods.StringifyCards(deck.cards);
			hand.playerHand = BlackjackMethods.StringifyCards(playerCards);
			hand = await BlackjackRepo.UpdateOne(hand);
	
			const status: string = await BlackjackMethods.GetHandStatus(hand);
			const msgSent = await channel.send(status);
	
			hand = await BlackjackRepo.FindActiveHandForUser(user, serverId);
			if (hand) {
				BlackjackMethods.ReactWithBlackjackOptions(msgSent);
	
				hand.latestMessageId = msgSent.id;
				await BlackjackRepo.UpdateOne(hand);
			}
		} catch (error) {
			MessagesMethods.SendErrorEmbed(channel, error);
		}
	}
	
	/*
		!stand / !stay
		when current user is already in an active hand: opt to take no more cards
	*/
	static async Stand(userId: string, serverId: string, channel: TextChannel | DMChannel | NewsChannel): Promise<void> {
		try {
			const user = await UserRepo.FindOne(userId, serverId);
			const hand = await BlackjackRepo.FindActiveHandForUser(user, serverId);
			if (!hand) throw "No active blackjack hand found!";
	
			const status: string = await BlackjackMethods.GetHandStatus(hand, true);
			channel.send(status);
		} catch (error) {
			MessagesMethods.SendErrorEmbed(channel, error);
		}
	}
	
	/*
		!doubledown
		when current user is already in an active hand: double the bet, deal the user one more card, and then stand
	*/
	static async DoubleDown(userId: string, serverId: string, channel: TextChannel | DMChannel | NewsChannel): Promise<void> {
		try {
			const user = await UserRepo.FindOne(userId, serverId);
			let hand = await BlackjackRepo.FindActiveHandForUser(user, serverId);
			if (!hand) throw "No active blackjack hand found!";
	
			const deck: Deck = new Deck(BlackjackMethods.UnStringifyCards(hand.deck));
			const playerCards: Card[] = BlackjackMethods.UnStringifyCards(hand.playerHand);
	
			if (playerCards.length > 2) throw "Cannot double down! Doubling down is only allowed on your first two cards.";
	
			playerCards.push(deck.deal());
	
			hand.deck = BlackjackMethods.StringifyCards(deck.cards);
			hand.playerHand = BlackjackMethods.StringifyCards(playerCards);
	
			if (hand.wager > hand.user.billyBucks) throw `Cannot double down! You only have ${user.billyBucks}!`;
			
			hand.user.billyBucks -= hand.wager;
			hand.wager = hand.wager * 2;
			hand = await BlackjackRepo.UpdateOne(hand);
	
			const status: string = await BlackjackMethods.GetHandStatus(hand, true);
			channel.send(status);
		} catch (error) {
			MessagesMethods.SendErrorEmbed(channel, error);
		}
	}
	
	static async OnMessageReact(react: MessageReaction, userId: string): Promise<void> {
		const user = await UserRepo.FindOne(userId, react.message.guild.id);
		const hand = await BlackjackRepo.FindActiveHandForUser(user, react.message.guild.id);
	
		if (!hand) return;
		if (react.message.id !== hand.latestMessageId) return;
	
		switch(react.emoji.toString()) {
			case "🟩": return BlackjackMethods.Hit(userId, react.message.guild.id, react.message.channel);
			case "🟨": return BlackjackMethods.Stand(userId, react.message.guild.id, react.message.channel);
			case "🟦": return BlackjackMethods.DoubleDown(userId, react.message.guild.id, react.message.channel);
		}
	}
	
	private static async GetHandStatus(hand: Blackjack, stand?: boolean): Promise<string> {
		let status = "", playerCountText = "", dealerCountText = "", handIsOver = false, winnings = 0;
	
		const playerCount: IBlackjackCount = BlackjackMethods.GetCountOfCards(hand.playerHand);
		playerCountText = BlackjackMethods.GetHandCountText(playerCount);
	
		let dealerCount: IBlackjackCount = BlackjackMethods.GetCountOfCards(hand.dealerHand);
	
		// player has blackjack (21 with first two cards)
		if (playerCount.softCount === 21 && hand.playerHand.length === 4) {
			// dealer also has blackjack (push)
			if (dealerCount.softCount === 21 && hand.dealerHand.length === 4) {
				status += "Blackjack! Dealer also has blackjack, so the hand is a push.\n\n";
			} else {
				status += `Blackjack! You collect a 3:2 payout of ${Math.floor(hand.wager * 1.5)} on your bet of ${hand.wager} BillyBucks!\n\n`;
				winnings = Math.floor(hand.wager * 1.5);
			}
			handIsOver = true;
		// player has hit to make 21 (not blackjack)
		} else if (playerCount.softCount === 21 || playerCount.hardCount === 21) {
			stand = true;
		// player busts
		} else if (playerCount.hardCount > 21) {
			status += `Busted! You lose your bet of ${hand.wager} BillyBucks!\n\n`;
			handIsOver = true;
		}
	
		// player chooses to stand (or has hit to make 21)
		if (stand && !handIsOver) {
			// when the player opts to stand, the dealer hits until 17 or higher is reached
			const deck: Deck = new Deck(BlackjackMethods.UnStringifyCards(hand.deck));
			const dealerCards: Card[] = BlackjackMethods.UnStringifyCards(hand.dealerHand);
	
			while (dealerCount.softCount < 17 || (dealerCount.hardCount < 17 && dealerCount.softCount > 21)) {
				dealerCards.push(deck.deal());
				dealerCount = BlackjackMethods.GetCountOfCards(BlackjackMethods.StringifyCards(dealerCards));
			}
	
			hand.dealerHand = BlackjackMethods.StringifyCards(dealerCards);
	
			dealerCountText = BlackjackMethods.GetHandCountText(dealerCount);
	
			// dealer busts
			if (dealerCount.hardCount > 21) {
				status += `Dealer busted! You collect a 1:1 payout on your bet of ${hand.wager} BillyBucks!\n\n`;
				winnings = hand.wager * 2;
			// both player and dealer have opted to stand and the hands are compared
			} else {
				const playerFinalCount = playerCount.softCount <= 21 ? playerCount.softCount : playerCount.hardCount;
				const dealerFinalCount = dealerCount.softCount <= 21 ? dealerCount.softCount : dealerCount.hardCount;
	
				if (playerFinalCount > dealerFinalCount) {
					status += `You win! You collect a 1:1 payout on your bet of ${hand.wager} BillyBucks!\n\n`;
					winnings = hand.wager * 2;
				} else if (playerFinalCount < dealerFinalCount) {
					status += `You lose your bet of ${hand.wager} BillyBucks!\n\n`;
				} else {
					status += "It's a push!\n\n";
					winnings = hand.wager;
				}
			}
	
			handIsOver = true;
		}
	
		status += `<@${hand.user.userId}>: ${playerCountText}\n${BlackjackMethods.DisplayCards(hand.playerHand)}\n\nDealer:`;
	
		if (handIsOver) {
			dealerCountText = BlackjackMethods.GetHandCountText(dealerCount);
			status += ` ${dealerCountText}\n${BlackjackMethods.DisplayCards(hand.dealerHand)}\n\n`;
	
			await BlackjackRepo.RemoveOne(hand);
			await UserRepo.UpdateBucks(hand.user.userId, hand.serverId, winnings, true);
	
			const bucks: number = await UserRepo.GetBucks(hand.user.userId, hand.serverId);
			status += `You now have ${bucks} BillyBucks.`;
		} else {
			status += `\n${BlackjackMethods.DisplayCards(hand.dealerHand.slice(0, 2))}🎴\n\n`;
			status += `Bet: ${hand.wager} BillyBucks\n\n`;
			status += "🟩\xa0\xa0`!hit`\n🟨\xa0\xa0`!stand`";
			if (hand.playerHand.length === 4) status += "\n🟦\xa0\xa0`!doubledown`";
		}
	
		return status;
	}
	
	/*
		Deal a new hand, write the gamestate to the database, and show the status of the hand
	*/
	private static async StartNewHand(msg: Message, user: User, bet: number): Promise<void> {
		const deck = new Deck();
		deck.shuffle();
	
		const playerCards: Card[] = [];
		const dealerCards: Card[] = [];
	
		playerCards.push(deck.deal());
		dealerCards.push(deck.deal());
		playerCards.push(deck.deal());
		dealerCards.push(deck.deal());
	
		const newHand = await BlackjackRepo.InsertOne(msg.guild.id, user, bet, BlackjackMethods.StringifyCards(deck.cards), BlackjackMethods.StringifyCards(playerCards), BlackjackMethods.StringifyCards(dealerCards));
	
		await UserRepo.UpdateBucks(msg.author.id, msg.guild.id, -bet, true);
	
		const status: string = await BlackjackMethods.GetHandStatus(newHand);
		const msgSent = await msg.channel.send(status);
	
		const hand = await BlackjackRepo.FindActiveHandForUser(user, msg.guild.id);
		if (hand) {
			BlackjackMethods.ReactWithBlackjackOptions(msgSent, true);
	
			hand.latestMessageId = msgSent.id;
			await BlackjackRepo.UpdateOne(hand);
		}
	}
	
	private static StringifyCards(cards: Card[]): string {
		let cardsString = "";
		for (const card of cards) {
			cardsString += card.value + card.suit;
		}
		return cardsString;
	}
	
	private static UnStringifyCards(cardsString: string): Card[] {
		const cards: Card[] = [];
		for (let i = 0; i < cardsString.length; i += 2) {
			cards.push(new Card(cardsString[i + 1], cardsString[i]));
		}
		return cards;
	}
	
	private static GetCountOfCards(cardsString: string): IBlackjackCount {
		const count: IBlackjackCount = { softCount: 0, hardCount: 0 };
		let aceCount = 0;
	
		for (let i = 0; i < cardsString.length; i += 2) {
			const value = cardsString[i];
			switch (true) {
				case (parseInt(value) >= 2 && parseInt(value) <= 9):
					count.softCount += parseInt(value);
					count.hardCount += parseInt(value);
					break;
				case ("TJQK".includes(value)):
					count.softCount += 10;
					count.hardCount += 10;
					break;
				case (value === "A"):
					aceCount++;
					count.hardCount++;
					break;
				default:
					throw `Invalid card value: ${value}`;
			}
		}
	
		if (aceCount > 0) count.softCount += 10 + aceCount;
	
		return count;
	}
	
	private static DisplayCards(cardsString: string): string {
		let displayString = "";
		for (let i = 0; i < cardsString.length; i += 2) {
			displayString += `${cardsString[i]}${BlackjackMethods.ConvertSuitToEmoji(cardsString[i + 1])}\xa0\xa0\xa0\xa0`;
		}
		return displayString;
	}
	
	private static ConvertSuitToEmoji(suit: string): string {
		switch(suit) {
			case "c": return "♣️";
			case "d": return "♦️";
			case "h": return "♥️";
			case "s": return "♠️";
		}
	}
	
	private static GetHandCountText(count: IBlackjackCount): string {
		// if soft and hard counts are different, there is at least one ace in the hand
		if (count.softCount !== count.hardCount) {
			if (count.softCount <= 21) {
				return `soft ${count.softCount}`;
			}
			return `hard ${count.hardCount}`;
		}
		return count.hardCount.toString();
	}
	
	private static ReactWithBlackjackOptions(msg: Message, canDoubleDown?: boolean): void {
		msg.react("🟩");
		msg.react("🟨");
		if (canDoubleDown) msg.react("🟦");
	}
	
	private static Help(): string {
		let msg = "`!blackjack [bet]` Start a new hand of blackjack betting the specified amount.\n";
		msg += "`!blackjack` Show the current status of your active blackjack hand.\n";
		msg += "`!hit` Take one more card.\n";
		msg += "`!stand` Take no more cards and end the hand.\n";
		msg += "`!doubledown` Double the bet amount, take one more card, and end the hand (only allowed on first two cards).";
		return msg;
	}
}


class Card {
	suit: string;
	value: string;

	constructor(suit: string, value: string) {
		this.suit = suit;
		this.value = value;
	}
}

class Deck {
	cards: Card[];
	SUITS: string = "cdhs";
	VALUES: string = "23456789TJQKA";

	constructor(cards?: Card[]) {
		if (cards) {
			this.cards = cards;
		} else {
			this.cards = [];
			for (const suit of this.SUITS) {
				for (const value of this.VALUES) {
					this.cards.push(new Card(suit, value));
				}
			}
		}
	}

	shuffle(): void {
		for (let n = 0; n < 10; n++)
			this.cards.sort(() => Math.random() - 0.5);
	}

	deal(): Card {
		return this.cards.shift();
	}
}
