import Discord, { Message, GuildMember, MessageEmbed } from "discord.js";

import { UserRepository as User } from "../repositories/UserRepository";
import { Colors } from "../types/Constants";

export default class Currency {

	public static async CheckBucks(msg: Message, prefix: string, mention: GuildMember): Promise<void> {
		try {
			const param: string[] = msg.content.slice(prefix.length).trim().split(" ");
			const buckEmbed: MessageEmbed = new MessageEmbed();

			if (param[0] || mention) {
				const found: Discord.GuildMember = mention ? mention : msg.guild.members.cache.find(a => a.user.username.toUpperCase().trim() === param[0].toUpperCase().trim());
				if (!found) {
					buckEmbed.setColor(Colors.red);
					buckEmbed.setTitle("Error");
					buckEmbed.setDescription(`Could not find ${param[0]} in this server.`);

					msg.reply(buckEmbed);
				}
				else {
					const user: Discord.User = found.user;
					const bucks: number = await User.GetBucks(user.id, msg.guild.id);

					buckEmbed.setColor(Colors.green);
					buckEmbed.setTitle(user.username);
					buckEmbed.setDescription(`${user.username} has ${bucks} BillyBucks!`);

					msg.reply(buckEmbed);
				}
				return;
			}

			const req: string = msg.author.id;
			const bucks: number = await User.GetBucks(req, msg.guild.id);

			buckEmbed.setColor(Colors.green);
			buckEmbed.setTitle(msg.author.username);
			buckEmbed.setDescription(`You have ${bucks} BillyBucks!`);

			msg.reply(buckEmbed);
		} catch (error) {
			const errorEmbed: MessageEmbed = new MessageEmbed();
			errorEmbed.setColor(Colors.red).setTitle("Error");
			if (error.message === "user not found")
				errorEmbed.setDescription("User has not been configured for this server. Please ask an admin to set them up with a Billy Bank account.");
			else
				errorEmbed.setDescription(error.message);
			msg.reply(errorEmbed);
		}
	}

}