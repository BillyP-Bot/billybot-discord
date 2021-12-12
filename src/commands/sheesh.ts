import { Message } from "discord.js";

import { ICommandHandler } from "../types";

export default {
	case: "sheesh",
	requiredArgs: false,
	arguments: [],
	properUsage: "!sheesh",
	resolver: async (msg: Message) => {
		msg.channel.send("Sheeeeeeeeeeeeeeeeesssshhhhh...");
	}
} as ICommandHandler;