import { Message } from "discord.js";

import { IPhraseHandler } from "../types";

export default {
	case: (msg: Message) => {
		if(msg.channel.type === "DM") return false;
		return /.*bad bot.*/gmi.test(msg.content);
	},
	resolver: (msg: Message) => {
		const billyHappy = msg.guild.emojis.cache.find((e) => e.name === "BillyMad");
		billyHappy && msg.react(billyHappy);
	}
} as IPhraseHandler;