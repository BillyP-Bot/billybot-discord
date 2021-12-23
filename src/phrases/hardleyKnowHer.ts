import { Message } from "discord.js";

import { IPhraseHandler } from "../types";

export default {
	case: (msg: Message) => {
		if(msg.channel.type === "DM") return false;
		return true;
	},
	resolver: (msg: Message) => {
		const words = msg.content.replace(/[^\w\s]/gi, "").split(" ").map(w => w.trim().toLowerCase());
		const matches = words.reduce((acc:string[], word: string) => {
			if(word.slice(-2) !== "er") return acc;
			acc.push(word);
			return acc;
		}, [] as string[]);
		if(matches.length <= 0) return;
		msg.reply(`${matches[0]}? I hardley know 'er!`);
	}
} as IPhraseHandler;