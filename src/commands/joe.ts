import { Message } from "discord.js";

import { ICommandHandler } from "../types";
import { ErrorMessage } from "../helpers/message";

export default {
	case: "joe",
	requiredArgs: false,
	arguments: [],
	properUsage: "!joe",
	resolver: async (msg: Message) => {
		try {
			msg.reply("https://cdn.discordapp.com/attachments/689463685571149933/847826319370092544/friday.mp4");
		} catch (error) {
			ErrorMessage(msg, error);
		}
	}
} as ICommandHandler;