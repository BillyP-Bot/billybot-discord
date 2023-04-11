/* eslint-disable no-unused-vars */
import type {
	ApplicationCommandOption,
	ChatInputCommandInteraction,
	GuildTextBasedChannel,
	TextBasedChannel,
	MessageReaction,
	Message,
	ApplicationCommandType,
	Permissions
} from "discord.js";

import type { ICard, IUser, IChallenge, IBet } from "btbot-types";
import { type } from "os";

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
	handler: (msg: Message) => Promise<any>;
	reactHandler?: (react: MessageReaction, sender_id: string) => Promise<any>;
}

export interface ISlashCommand {
	id?: string;
	name: string;
	description: string;
	options?: ISlashCommandOption[];
	type?: ApplicationCommandType;
	default_member_permissions?: Permissions;
	default_permission?: boolean;
	nsfw?: boolean;
	handler: (int: ChatInputCommandInteraction) => Promise<void>;
	reactHandler?: (react: MessageReaction, sender_id: string) => Promise<any>;
}

// use these instead of minValue, maxValue, etc.
export type ISlashCommandOption = ApplicationCommandOption & {
	min_value?: number;
	max_value?: number;
	min_length?: number;
	max_length?: number;
};

export interface IChallengeResponse {
	pages: number;
	challenges: IChallenge[];
}
export type DiscordChannel = GuildTextBasedChannel | TextBasedChannel;
