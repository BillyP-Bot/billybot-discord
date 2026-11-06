import type { IBet, ICard, IChallenge, IUser } from "btbot-types";
import type {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  SlashCommandOptionsOnlyBuilder,
  SlashCommandSubcommandsOnlyBuilder,
} from "discord.js";

export type ApiError = {
  status?: number;
  ok?: boolean;
  error?: string;
  message?: string;
  [key: string]: unknown;
};

// several endpoints respond with the updated balances of the users involved, keyed by user id
export type UserLookup = Record<string, Pick<IUser, "username" | "billy_bucks">>;

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
  // only included once the hand is complete
  billy_bucks?: number;
  status: string;
};

export type BetAggregate = { _id: string; bets: IBet[]; count: number }[];

export interface IChallengeResponse {
  pages: number;
  challenges: IChallenge[];
}

export type SlashCommand = {
  // adding options or subcommands to a SlashCommandBuilder narrows it to one of the other two types
  data: SlashCommandBuilder | SlashCommandOptionsOnlyBuilder | SlashCommandSubcommandsOnlyBuilder;
  // commands are only dispatched for interactions in a cached guild (see src/index.ts), so guild,
  // guildId, and member are all guaranteed to be non-null
  execute: (interaction: ChatInputCommandInteraction<"cached">) => Promise<void>;
};
