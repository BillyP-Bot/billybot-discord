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
	id: string
}