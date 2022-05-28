/* eslint-disable no-unused-vars */
import type { DMChannel, Message, MessageReaction, NewsChannel, TextChannel } from "discord.js";
import type { ICard, IUser, IChallenge } from "btbot-types";

export type ApiError = {
	status?: number;
	ok?: boolean;
	error?: string;
	[key: string]: any;
};

export type UserLookup = Record<string, IUser>;
export type ApiResponse = ApiError & UserLookup;
export type BlackJackGameResponse = {
	_id: string;
	server_id: string;
	user: string;
	wager: number;
	payout: number;
	turn: number;
	won: boolean;
	player_count: string;
	dealer_count: string;
	deck: ICard[];
	player_hand: ICard[];
	dealer_hand: ICard[];
	is_complete: boolean;
	billy_bucks: number;
	status: string;
};

export interface ICommand {
	prefix: RegExp;
	command?: string;
	description: string;
	handler: (msg: Message) => Promise<any>;
	reactHandler?: (react: MessageReaction, sender_id: string) => Promise<any>;
}

export interface IChallengeResponse {
	pages: number;
	challenges: IChallenge[];
}
export type DiscordChannel = TextChannel | DMChannel | NewsChannel;
