/* eslint-disable no-unused-vars */
import type { Message } from "discord.js";

import { CardSuit } from "./enums";

export interface IEngagementMetrics {
	posts: number
	reactions_used: number
	reactions_received: number
	average_reactions_per_post: number
	mentions: number
}

export interface IGamblingMetrics {
	roulette: {
		spins: number
		red_spins: number
		black_spins: number
		green_spins: number
		wins: number
		losses: number
		overall_winnings: number
		overall_losings: number
	}
}

export interface IUserMetrics {
	engagement: IEngagementMetrics
	gambling: IGamblingMetrics
}

export interface IUser {
	_id: string
	billy_bucks: number
	server_id: string
	user_id: string
	username: string
	discriminator: string
	avatar_hash?: string
	allowance_available: boolean
	has_lottery_ticket: boolean
	is_admin: boolean
	is_mayor: boolean
	metrics: IUserMetrics
	birthday?: Date | string
	created_at: Date
	updated_at: Date
}

export type ApiError = {
	status?: number
	ok?: boolean
	error?: string
	[key: string]: any
}

export interface ICard {
	suit: CardSuit
	value: number
}

export type UserLookup = Record<string, IUser>
export type ApiResponse = ApiError & UserLookup
export type BlackJackGameResponse = {
	_id: string
	server_id: string
	user: string
	wager: number
	payout: number
	turn: number
	won: boolean
	player_count: string
	dealer_count: string
	deck: ICard[],
	player_hand: ICard[]
	dealer_hand: ICard[]
	is_complete: boolean
	billy_bucks: number
	status: string
}

export interface ICommand {
	prefix: RegExp
	command?: string
	description: string
	handler: (msg: Message) => Promise<any>
}