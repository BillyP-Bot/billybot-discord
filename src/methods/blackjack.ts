import { Message } from "discord.js";

import { replyWithErrorEmbed } from "./messages";
import { User } from "../models/User";
import { BlackjackRepository as BlackjackRepo } from "../repositories/BlackjackRepository";
import { UserRepository as UserRepo } from "../repositories/UserRepository";
import { Blackjack } from "../models/Blackjack";
import { IBlackjackCount } from "../types/Abstract";

const SUITS: string = "cdhs";
const VALUES: string = "23456789TJQKA";

/*
	!blackjack [bet]
	when current user is not already in an active hand: initiate a new hand for the specified bet amount

	!blackjack
	when current user is already in an active hand: show the current state of the hand
*/
export const blackjack = async (msg: Message, prefix: string): Promise<void> => {
	try {
		const args: string[] = msg.content.slice(prefix.length).trim().split(" ");
		if (args[0] === "") args.splice(0, 1);
		if (args.length > 1) throw "Invalid format! Expects 0 or 1 argument(s).";

		const user = await UserRepo.FindOne(msg.author.id, msg.guild.id);
		const hand = await BlackjackRepo.FindActiveHandForUser(user, msg.guild.id);

		if (hand) {
			// show the current state of the hand
			const status: string = await getHandStatus(hand);
			msg.channel.send(status);
		} else {
			// initiate a new hand for the specified bet amount
			const bet = parseInt(args[0]);
			if (isNaN(bet) || bet < 10) throw "Must bet at least 10 BillyBucks to play a hand of blackjack:\n\n`!blackjack [bet]`";
			if (bet > user.billyBucks) throw `Cannot bet ${bet} BillyBucks, you only have ${user.billyBucks}!`;

			await startNewHand(msg, user, bet);
		}

	} catch (error) {
		replyWithErrorEmbed(msg, error);
	}
};

/*
	!hit
	when current user is already in an active hand: deal the user one more card
*/
export const hit = async (msg: Message): Promise<void> => {
	try {
		const user = await UserRepo.FindOne(msg.author.id, msg.guild.id);
		let hand = await BlackjackRepo.FindActiveHandForUser(user, msg.guild.id);
		if (!hand) throw "No active blackjack hand found!";

		let deck: Deck = new Deck(unStringifyCards(hand.deck));
		let playerCards: Card[] = unStringifyCards(hand.playerHand);

		playerCards.push(deck.deal());

		hand.deck = stringifyCards(deck.cards);
		hand.playerHand = stringifyCards(playerCards);
		hand = await BlackjackRepo.UpdateOne(hand);

		const status: string = await getHandStatus(hand);
		msg.channel.send(status);
	} catch (error) {
		replyWithErrorEmbed(msg, error);
	}
};

/*
	!stand / !stay
	when current user is already in an active hand: opt to take no more cards
*/
export const stand = async (msg: Message): Promise<void> => {
	try {
		const user = await UserRepo.FindOne(msg.author.id, msg.guild.id);
		const hand = await BlackjackRepo.FindActiveHandForUser(user, msg.guild.id);
		if (!hand) throw "No active blackjack hand found!";

		const status: string = await getHandStatus(hand, true);
		msg.channel.send(status);
	} catch (error) {
		replyWithErrorEmbed(msg, error);
	}
};

/*
	!doubledown
	when current user is already in an active hand: double the bet, deal the user one more card, and then stand
*/
export const doubleDown = async (msg: Message): Promise<void> => {
	try {
		const user = await UserRepo.FindOne(msg.author.id, msg.guild.id);
		let hand = await BlackjackRepo.FindActiveHandForUser(user, msg.guild.id);
		if (!hand) throw "No active blackjack hand found!";

		let deck: Deck = new Deck(unStringifyCards(hand.deck));
		let playerCards: Card[] = unStringifyCards(hand.playerHand);

		playerCards.push(deck.deal());

		hand.deck = stringifyCards(deck.cards);
		hand.playerHand = stringifyCards(playerCards);
		
		hand.user.billyBucks -= hand.wager;
		hand.wager = hand.wager * 2;
		hand = await BlackjackRepo.UpdateOne(hand);

		const status: string = await getHandStatus(hand, true);
		msg.channel.send(status);
	} catch (error) {
		replyWithErrorEmbed(msg, error);
	}
};

const getHandStatus = async (hand: Blackjack, stand?: boolean): Promise<string> => {
	let status = "", playerCountText = "", dealerCountText = "", handIsOver = false, blackjack = false, winnings = 0;

	let playerCount: IBlackjackCount = getCountOfCards(hand.playerHand);
	playerCountText = getHandCountText(playerCount);

	let dealerCount: IBlackjackCount = getCountOfCards(hand.dealerHand);

	// player has blackjack (21 with first two cards)
	if (playerCount.softCount === 21 && hand.playerHand.length === 4) {
		// dealer also has blackjack (push)
		if (dealerCount.softCount === 21 && hand.dealerHand.length === 4) {
			status += "Blackjack! Dealer also has blackjack, so the hand is a push.";
			winnings = hand.wager;
		} else {
			status += `Blackjack! You collect a 3:2 payout of ${Math.floor(hand.wager * 1.5)} on your bet of ${hand.wager} BillyBucks!\n\n`;
			winnings = Math.floor(hand.wager * 2.5);
		}
		handIsOver = true;
		blackjack = true;
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
		let deck: Deck = new Deck(unStringifyCards(hand.deck));
		let dealerCards: Card[] = unStringifyCards(hand.dealerHand);

		while (dealerCount.softCount < 17 || (dealerCount.hardCount < 17 && dealerCount.softCount > 21)) {
			dealerCards.push(deck.deal());
			dealerCount = getCountOfCards(stringifyCards(dealerCards));
		}

		hand.dealerHand = stringifyCards(dealerCards);

		dealerCountText = getHandCountText(dealerCount);

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

	status += `<@${hand.user.userId}>: ${playerCountText}\n`;
	status += `${displayCards(hand.playerHand)}\n\n`;

	if (blackjack) dealerCountText = getHandCountText(dealerCount);

	status += `Dealer: ${dealerCountText}\n`;
	if (stand || blackjack) {
		status += `${displayCards(hand.dealerHand)}\n\n`;
	} else {
		status += `${displayCards(hand.dealerHand.slice(0, 2))}🎴\n\n`;
	}

	status += `Bet: ${hand.wager}\n\n`;

	if (handIsOver) {
		await BlackjackRepo.RemoveOne(hand);
		await UserRepo.UpdateBucks(hand.user.userId, hand.serverId, winnings, true);
	} else {
		status += "Options: `!hit`, `!stand`, or `!doubledown`";
	}

	return status;
};

/*
	Deal a new hand, write the gamestate to the database, and show the status of the hand
*/
const startNewHand = async (msg: Message, user: User, bet: number): Promise<void> => {
	const deck = new Deck();
	deck.shuffle();

	const playerCards: Card[] = [];
	const dealerCards: Card[] = [];

	playerCards.push(deck.deal());
	dealerCards.push(deck.deal());
	playerCards.push(deck.deal());
	dealerCards.push(deck.deal());

	const newHand = await BlackjackRepo.InsertOne(msg.guild.id, user, bet, stringifyCards(deck.cards), stringifyCards(playerCards), stringifyCards(dealerCards));

	await UserRepo.UpdateBucks(msg.author.id, msg.guild.id, -bet, true);

	const status: string = await getHandStatus(newHand);
	msg.channel.send(status);
};

const stringifyCards = (cards: Card[]): string => {
	let cardsString = "";
	for (const card of cards) {
		cardsString += card.value + card.suit;
	}
	return cardsString;
};

const unStringifyCards = (cardsString: string): Card[] => {
	let cards: Card[] = [];
	for (let i = 0; i < cardsString.length; i += 2) {
		cards.push(new Card(cardsString[i + 1], cardsString[i]));
	}
	return cards;
};

const getCountOfCards = (cardsString: string): IBlackjackCount => {
	let count: IBlackjackCount = { softCount: 0, hardCount: 0 };
	let aceCount = 0;

	for (let i = 0; i < cardsString.length; i += 2) {
		let value = cardsString[i];
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
};

const displayCards = (cardsString: string): string => {
	let displayString = "";
	for (let i = 0; i < cardsString.length; i += 2) {
		displayString += `${cardsString[i]}${convertSuitToEmoji(cardsString[i + 1])}\xa0\xa0\xa0\xa0`;
	}
	return displayString;
};

const convertSuitToEmoji = (suit: string): string => {
	switch(suit) {
	case "c": return "♣️";
	case "d": return "♦️";
	case "h": return "♥️";
	case "s": return "♠️";
	}
};

const getHandCountText = (count: IBlackjackCount): string => {
	// if soft and hard counts are different, there is at least one ace in the hand
	if (count.softCount !== count.hardCount) {
		if (count.softCount <= 21) {
			return `soft ${count.softCount}`;
		}
		return `hard ${count.hardCount}`;
	}
	return count.hardCount.toString();
};

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

	constructor(cards?: Card[]) {
		if (cards) {
			this.cards = cards;
		} else {
			this.cards = [];
			for (const suit of SUITS) {
				for (const value of VALUES) {
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
