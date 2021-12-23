import { Message } from "discord.js";

import { IPhraseHandler } from "../types";
import { ErrorMessage } from "../helpers/message";

export default {
	case: (msg: Message) => {
		if(msg.channel.type === "DM") return false;
		return /.*!loop.*/gmi.test(msg.content);
	},
	resolver: (msg: Message) => {
		try {
			msg.reply("no !loop please!");
		} catch (error) {
			ErrorMessage(msg, error);	
		}
	}
} as IPhraseHandler;