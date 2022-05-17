import type { Message } from "discord.js";

import type { ICommand } from "../types";

export const bingCommand: ICommand = {
	prefix: /.*bing.*/gmi,
	command: "!bing",
	description: "testing",
	handler: async (msg: Message) => {
		await msg.reply("bong");
	}
};