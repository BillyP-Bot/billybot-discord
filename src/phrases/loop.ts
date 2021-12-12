import { Message } from "discord.js";

import { IPhraseHandler } from "../types";

export default {
	case: /.*!loop.*/gmi,
	resolver: (msg: Message) => {
		msg.reply("no !loop please!");
	}
} as IPhraseHandler;