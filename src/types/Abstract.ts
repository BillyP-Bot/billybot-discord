import { Client, Message } from "discord.js";

export interface MessageHandler {
	msg: Message,
	client: Client
}

export interface ILogBody {
	log: string,
	issuer: string
}

export interface IUserList {
	username: string,
	id: string,
	serverId: string
}

export interface ILoanList {
	userId: string,
	serverId: string,
	amount: number,
	interestRate: number,
	minPaymentAmt: number
}

export interface ICommand {
	prefix: string,
	description: string
}

export interface ICreditScoreResult {
	creditRating: string,
	interestRate: number,
	creditLimit: number
}