import { Message } from "discord.js";

import { replyWithErrorEmbed } from "./messages";

const SUITS: string = "cdhs";
const VALUES: string = "23456789TJQKA";

/*
	!blackjack @[wager]
	when current user is not already in an active hand: initiate a new hand for the specified wager amount

	!blackjack
	when current user is already in an active hand: show the current state of the hand
*/
export const blackjack = async (msg: Message, prefix: string): Promise<void> => {
	try {
		const args: string[] = msg.content.slice(prefix.length).trim().split(" ");
		if (args[0] === "") args.splice(0, 1);
		if (args.length > 1) throw "Invalid format! Expects 0 or 1 argument(s).";
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
		//
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
		//
	} catch (error) {
		replyWithErrorEmbed(msg, error);
	}
};

class Card {
	suit: string;
	value: string;

	constructor(suit: string, value: string) {
		this.suit = suit;
		this.value = value;
	}

	count(): number {
		switch(true) {
		case (parseInt(this.value) >= 2 && parseInt(this.value) <= 9):
			return parseInt(this.value);
		case("TJQK".includes(this.value)):
			return 10;
		case(this.value === "A"):
			return 11;
		default:
			throw `Invalid card value: ${this.value}`;
		}
	}
}

class Deck {
	cards: Card[];

	constructor() {
		this.cards = [];
		for (const suit of SUITS) {
			for (const value of VALUES) {
				this.cards.push(new Card(suit, value));
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

