import type { ChatInputCommandInteraction, Message } from "discord.js";

import { ApplicationCommandOptionType } from "discord.js";

import type { ICommand } from "../types";

export const bingCommand: ICommand = {
	prefix: /.*!bing.*/gim,
	command: "!bing",
	name: "bing",
	description: "bong?",
	handler: async (msg: Message) => {
		await msg.reply("bong");
	},
	slashHandler: async (int: ChatInputCommandInteraction) => {
		const extraText = int.options.get("extra-text")?.value;
		await int.reply(`bong${extraText ? " " + extraText : ""}`);
	},
	options: [
		{
			name: "extra-text",
			description: "Some extra text to append to 'bong' in the reply",
			type: ApplicationCommandOptionType.String
		}
	]
};
