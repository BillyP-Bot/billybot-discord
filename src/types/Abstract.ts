import { Client, Message } from "discord.js";
import { Baseball } from "../models/Baseball";

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

export interface IAtBatOutcome {
	game: Baseball,
	output: any
}

export interface IBaserunningResult {
	bases: string,
	rbi: number
}

export interface IDisc {
	name: string,
	brand: string,
	category: string,
	speed: string,
	glide: string,
	turn: string,
	fade: string,
	stability: string,
	link: string,
	pic: string,
	slug: string
}