import { Message } from "discord.js";

import { IPhraseHandler } from "../types";

export default {
	case: (msg: Message) => {
		if(msg.channel.type === "DM") return false;
		if(msg.channel.name !== "work-stuff") return false;
		if(!msg.member.roles.cache.find(r => r.name === "FormerPartnerIncorporated")) return false;
		return true;
	},
	resolver: (msg: Message) => {
		const react = msg.guild.emojis.cache.find(e => e.name === "BillyMad");
		react && msg.react(react);
	}
} as IPhraseHandler;