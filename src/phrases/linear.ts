import { Message } from "discord.js";

import { IPhraseHandler } from "../types";

export default {
	case: (msg: Message) => {
		if(msg.channel.type === "DM") return false;
		return /.*linear.*/gmi.test(msg.content);
	},
	resolver: (msg: Message) => {
		msg.reply("We have to work exponentially, not linearly!");
	}
} as IPhraseHandler;