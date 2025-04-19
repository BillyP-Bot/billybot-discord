import { BlackjackReacts, CardSuit, type ICard } from "btbot-types";
import type { MessageReaction } from "discord.js";

import { CommandNames } from "@enums";
import { mentionCommand } from "@helpers";
import type { BlackJackGameResponse } from "@types";

export const suitLookup: Record<CardSuit, string> = {
	[CardSuit.clubs]: "♣️",
	[CardSuit.hearts]: "♥️",
	[CardSuit.spades]: "♠️",
	[CardSuit.diamonds]: "♦️"
};

export const valueLookup: Record<number, string> = {
	1: "A",
	2: "2",
	3: "3",
	4: "4",
	5: "5",
	6: "6",
	7: "7",
	8: "8",
	9: "9",
	10: "10",
	11: "J",
	12: "Q",
	13: "K"
};

export const buildReadableHand = (hand: ICard[]) => {
	return hand.map(({ suit, value }) => `${valueLookup[value]}${suitLookup[suit]}`);
};

export const buildBlackjackResponse = (data: BlackJackGameResponse, userId: string) => {
	const {
		player_hand,
		dealer_hand,
		player_count,
		is_complete,
		dealer_count,
		wager,
		status,
		billy_bucks,
		turn
	} = data;
	let response = `<@${userId}>: ${player_count}\n`;
	const readablePlayer = buildReadableHand(player_hand);
	const readableDealer = buildReadableHand(dealer_hand);
	const defaultStatus = `${BlackjackReacts.hit} ${mentionCommand(CommandNames.hit)}\n${
		BlackjackReacts.stand
	} ${mentionCommand(CommandNames.stand)}${
		turn === 0
			? `\n${BlackjackReacts.doubleDown} ${mentionCommand(CommandNames.doubledown)}`
			: ""
	}`;
	response += `${readablePlayer.join("  ")}\n\n`;
	response += `Dealer: ${is_complete ? dealer_count : ""}\n`;
	response += `${readableDealer.join("  ")} ${is_complete ? "" : "🎴"}\n\n`;
	response += `Bet: ${wager}\n\n`;
	response += `${status || defaultStatus}`;
	if (is_complete) {
		response += `\n\nYou now have ${billy_bucks} BillyBucks!`;
	}
	return response;
};

export const isBlackjackReact = (react: MessageReaction) => {
	return (
		[BlackjackReacts.hit, BlackjackReacts.stand, BlackjackReacts.doubleDown] as string[]
	).includes(react.emoji.toString());
};
