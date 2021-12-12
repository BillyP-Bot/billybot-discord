import { Message } from "discord.js";

import { IPhraseHandler } from "../types";

export default {
	case: /.*vendor.*/gmi,
	resolver: (msg: Message) => {
		msg.reply("Don't blame the vendor!");
	}
} as IPhraseHandler;