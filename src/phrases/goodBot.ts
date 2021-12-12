import { Message } from "discord.js";

import { IPhraseHandler } from "../types";

export default {
	case: /.*good bot.*/gmi,
	resolver: (msg: Message) => {
		const billyHappy = msg.guild.emojis.cache.find((e) => e.name === "BillyHappy");
		msg.react(billyHappy);
	}
} as IPhraseHandler;