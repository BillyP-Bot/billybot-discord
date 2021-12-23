import { Message } from "discord.js";

import { IPhraseHandler } from "../types";
import { ErrorMessage } from "../helpers/message";

export default {
	case: (msg: Message) => {
		if(msg.channel.type === "DM") return false;
		return /.*good bot.*/gmi.test(msg.content);
	},
	resolver: (msg: Message) => {
		try {
			const billyHappy = msg.guild.emojis.cache.find((e) => e.name === "BillyHappy");
			billyHappy && msg.react(billyHappy);
		} catch (error) {
			ErrorMessage(msg, error);	
		}
	}
} as IPhraseHandler;