import { Message } from "discord.js";

import { ICommandHandler } from "../types";
import { ErrorMessage } from "../helpers/message";

export default {
	case: "sheesh",
	requiredArgs: false,
	arguments: [],
	properUsage: "!sheesh",
	resolver: async (msg: Message) => {
		try {
			msg.channel.send("Sheeeeeeeeeeeeeeeeesssshhhhh...");
		} catch (error) {
			ErrorMessage(msg, error);	
		}
	}
} as ICommandHandler;