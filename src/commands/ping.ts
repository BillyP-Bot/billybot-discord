import { Message } from "discord.js";

import { ICommandHandler } from "../types";
import { ErrorMessage } from "../helpers/message";

export default {
	case: "ping",
	requiredArgs: false,
	arguments: [],
	properUsage: "!ping",
	resolver: async (msg: Message) => {
		try {
			await msg.reply("pong");
		} catch (error) {
			ErrorMessage(msg, error);	
		}
	}
} as ICommandHandler;