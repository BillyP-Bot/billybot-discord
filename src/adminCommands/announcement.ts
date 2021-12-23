import { Message, MessageEmbed, TextChannel } from "discord.js";

import { client } from "../helpers/client";
import { Rest } from "../services/rest";
import { ErrorMessage } from "../helpers/message";
import { IAdminCommandHandler } from "../types";

export default {
	case: (msg: Message) => msg.channel.type !== "DM" && msg.channel.name === "admin-announcements",
	resolver: async (msg: Message) => {
		try {
			const adminText: string = msg.content.replace("!adminMsg", "").trim();
			
			await client.guilds.fetch();
			const guilds = client.guilds.cache;
			const generalChannels = [];
		
			for (const guild of guilds) {
				const general = guild[1].channels.cache.filter(a => a.name === "general");
				generalChannels.push(general);
			}

			await Rest.Post("logs/newlog", { log: adminText, issuer: msg.author.username });
		
			const embed = new MessageEmbed();
			embed.setColor("#1bb0a2");
			embed.setTitle("Admin Update");
			embed.addField(`Update From ${msg.author.username}`, adminText);
			embed.addField("Rolling Log", "See all changelogs [here](https://btbackend.herokuapp.com/api/logs)");
		
			generalChannels.forEach(async ([channel]) => {
				const c = channel[1] as TextChannel;
				c.send({ embeds: [embed] });
			});
		} catch (error) {
			ErrorMessage(msg, error);	
		}
	}
} as IAdminCommandHandler;