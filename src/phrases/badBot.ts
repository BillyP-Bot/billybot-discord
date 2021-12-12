import { Message } from "discord.js";

import { IPhraseHandler } from "../types";

export default {
	case: /.*bad bot.*/gmi,
	resolver: (msg: Message) => {
		const billyHappy = msg.guild.emojis.cache.find((e) => e.name === "BillyMad");
		msg.react(billyHappy);
	}
} as IPhraseHandler;