import { Message } from "discord.js";

import { IPhraseHandler } from "../types";

export default {
	case: (msg: Message) => {
		if(msg.channel.type === "DM") return false;
		return /.*vendor.*/gmi.test(msg.content);
	},
	resolver: (msg: Message) => {
		msg.reply("Don't blame the vendor!");
	}
} as IPhraseHandler;