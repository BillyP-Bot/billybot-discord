/* eslint-disable no-unused-vars */
import type {
	ApplicationCommandOption,
	ChatInputCommandInteraction,
	GuildTextBasedChannel,
	TextBasedChannel,
	Message,
	MessageReaction
} from "discord.js";
import { DisTube } from "distube";

import type { ICard, IUser, IChallenge, IBet } from "btbot-types";

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

export type BetAggregate = [{ _id: string; bets: IBet[]; count: number }];

export interface ICommand {
	prefix: RegExp;
	command?: string;
	description: string;
	handler: (msg: Message, distube?: DisTube) => Promise<any>;
	reactHandler?: (react: MessageReaction, sender_id: string) => Promise<any>;
	slash?: ISlashCommand;
}

export interface ISlashCommand {
	id?: string;
	name: string;
	description: string;
	options?: ApplicationCommandOption[];
	handler: (int: ChatInputCommandInteraction) => Promise<void>;
	reactHandler?: (react: MessageReaction, sender_id: string) => Promise<any>;
}

export interface IChallengeResponse {
	pages: number;
	challenges: IChallenge[];
}
export type DiscordChannel = GuildTextBasedChannel | TextBasedChannel;
