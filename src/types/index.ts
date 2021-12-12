/* eslint-disable no-unused-vars */
import { Message } from "discord.js";

/**
 *
 * @export
 * @interface ICommandHandler
 */
export interface ICommandHandler {
	case: string,
	requiredArgs: boolean,
	arguments: string[],
	properUsage: string,
	resolver: (msg: Message, args?: string[]) => Promise<void>
}

/**
 *
 * @export
 * @interface IPhraseHandler
 */
export interface IPhraseHandler {
	case: RegExp,
	resolver: (msg: Message) => Promise<void>
}

/**
 *
 * @export
 * @interface IUser
 */
export interface IUser {
	username: string,
	user_id: string,
	server_id: string,
	billy_bucks?: number,
	last_allowance?: string,
	creditScore?: number,
	has_active_loan?: boolean,
	in_lottery?: boolean
}

/**
 *
 * @export
 * @interface IAdminCommandHandler
 */
export interface IAdminCommandHandler {
	case: (msg: Message) => boolean,
	resolver: (msg: Message, args?: string[]) => Promise<void>
}

export type RouletteColor = "RED" | "BLACK" | "GREEN";