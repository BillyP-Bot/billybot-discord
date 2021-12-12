import { Message } from "discord.js";

import { IPhraseHandler } from "../types";

export default {
	case: /.*linear.*/gmi,
	resolver: (msg: Message) => {
		msg.reply("We have to work exponentially, not linearly!");
	}
} as IPhraseHandler;