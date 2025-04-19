import type { IBet, ICard, IChallenge, IUser } from "btbot-types";
import type {
	ApplicationCommandOption,
	ApplicationCommandType,
	ChatInputCommandInteraction,
	GuildTextBasedChannel,
	MessageReaction,
	Permissions,
	TextBasedChannel
} from "discord.js";

export type ApiError = {
	status?: number;
	ok?: boolean;
	error?: string;
	[key: string]: unknown;
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
	reactHandler?: (react: MessageReaction, sender_id: string) => Promise<void>;
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
