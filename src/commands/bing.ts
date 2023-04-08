import type { ChatInputCommandInteraction, Message } from "discord.js";

import type { ICommand } from "../types";
export const bingCommand: ICommand = {
	prefix: /.*!bing.*/gim,
	command: "!bing",
	description: "bong?",
	handler: async (msg: Message) => {
		await msg.reply("bong");
	},
	slash: {
		name: "bing",
		description: "bong?",
		handler: async (int: ChatInputCommandInteraction) => {
			await int.reply("bong");
		}
	}
};
