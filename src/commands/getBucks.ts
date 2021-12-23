import { Message, MessageEmbed } from "discord.js";

import { BtBackend } from "../services/rest";
import { ErrorMessage } from "../helpers/message";
import { ICommandHandler } from "../types";

export default {
	case: "bucks",
	requiredArgs: false,
	arguments: ["username"],
	properUsage: "!bucks\n!bucks [username]",
	resolver: async (msg: Message, args: string[]) => {
		try {
			const buckEmbed = new MessageEmbed();
			buckEmbed.setColor("GREEN");
			
			if (args[0]) {
				const found = msg.guild.members.cache.find(a => a.user.username.toUpperCase().trim() === args[0].toUpperCase().trim());
				if (!found) throw new Error(`Could not find ${args[0]} in this server.`);
				const { user: _user } = found;
				const { user } = await (await BtBackend.Client.get("user", { params: { serverId: msg.guild.id, userId: _user.id } })).data;
				buckEmbed.setTitle(user.username);
				buckEmbed.setDescription(`${user.username} has ${user.billy_bucks} BillyBucks!`);
				await msg.channel.send({ embeds: [buckEmbed] });
				return;
			}
		
			const { user } = await (await BtBackend.Client.get("user", { params: { serverId: msg.guild.id, userId: msg.author.id } })).data;
		
			buckEmbed.setTitle(msg.author.username);
			buckEmbed.setDescription(`You have ${user.billy_bucks} BillyBucks!`);

			await msg.channel.send({ embeds: [buckEmbed] });
		} catch (error) {
			ErrorMessage(msg, error);
		}
	}
} as ICommandHandler;