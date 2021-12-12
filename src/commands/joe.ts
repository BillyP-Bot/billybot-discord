import { Message } from "discord.js";

import { ICommandHandler } from "../Types";

export default {
	case: "joe",
	requiredArgs: false,
	arguments: [],
	properUsage: "!joe",
	resolver: async (msg: Message) => {
		msg.reply("https://cdn.discordapp.com/attachments/689463685571149933/847826319370092544/friday.mp4");
	}
} as ICommandHandler;