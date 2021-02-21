import Discord, { Message, Collection, GuildMember, MessageEmbed, Client, Guild, Role } from "discord.js";

import { IUser } from "../models/User";
import { User } from "../repositories/UserRepository";
import { Colors, Roles } from "../types/Constants";
import { IUserList } from "../types/Abstract";

export default class Currency {

	public static async Configure(client: Client, msg: Message): Promise<void> {
		try {
			const devRole: Role = msg.member.roles.cache.find(a => a.name == Roles.billyDev);
			if(!devRole) throw "user permission denied";
			
			let notBot: IUserList[] = [];

			const serverId: string = msg.guild.id;
			const _guild: Guild = await client.guilds.fetch(serverId);

			const members: Collection<string, Discord.GuildMember> = await _guild.members.fetch();
			const notBots: Collection<string, GuildMember> = members.filter(a => a.user.bot == false);
			notBots.forEach(mem => notBot.push({ username: mem.user.username, id: mem.user.id, serverId: serverId }));

			let insertCOunt: number = 0;
			for (let i = 0; i < notBot.length; i++) {
				try {
					const inserted: boolean = await User.InsertOne({ username: notBot[i].username, id: notBot[i].id, serverId: notBot[i].serverId });
					if (inserted) insertCOunt += 1;
				} catch (error) {
					console.log(error);
				}
			}

			msg.reply(`configuration done! ${insertCOunt} users updated.`);
		} catch (error) {
			const errorEmbed: MessageEmbed = new MessageEmbed();
			errorEmbed.setColor(Colors.red).setTitle("Error");
			errorEmbed.setDescription(error);
			msg.reply(errorEmbed);
		}
	}

	public static async Allowance(msg: Message): Promise<void> {
		try {
			const serverId: string = msg.guild.id;
			const update: number = await User.Allowance(msg.member.id, serverId);

			const buckEmbed: MessageEmbed = new MessageEmbed();
			buckEmbed.setColor(Colors.green);
			buckEmbed.setTitle("+ 200");
			buckEmbed.setDescription(`Here's your allowance, ${msg.member.user.username}! You now have ${update} BillyBucks!`);

			msg.reply(buckEmbed);
			return;
		} catch (error) {
			const errorEmbed: MessageEmbed = new MessageEmbed();
			errorEmbed.setColor(Colors.red).setTitle("Error");
			errorEmbed.setDescription(error);
			msg.reply(errorEmbed);
		}
	}

	public static async CheckBucks(msg: Message, prefix: string): Promise<void> {
		try {
			const param: string[] = msg.content.slice(prefix.length).trim().split(" ");

			if (param[0]) {
				const found: Discord.User = msg.guild.members.cache.find(a => a.user.username.toUpperCase().trim() === param[0].toUpperCase().trim()).user;

				const bucks: number = await User.GetBucks(found.id);

				const buckEmbed: MessageEmbed = new MessageEmbed();
				buckEmbed.setColor(Colors.green);
				buckEmbed.setTitle(found.username);
				buckEmbed.setDescription(`${found.username} has ${bucks} BillyBucks!`);

				msg.reply(buckEmbed);
				return;
			}

			const req: string = msg.author.id;
			const bucks: number = await User.GetBucks(req);

			const buckEmbed: MessageEmbed = new MessageEmbed();
			buckEmbed.setColor(Colors.green);
			buckEmbed.setTitle(msg.author.username);
			buckEmbed.setDescription(`you have ${bucks} BillyBucks!`);

			msg.reply(buckEmbed);
		} catch (error) {
			const errorEmbed: MessageEmbed = new MessageEmbed();
			errorEmbed.setColor(Colors.red).setTitle("Error");
			errorEmbed.setDescription(error.message);
			msg.reply(errorEmbed);
		}
	}

	public static async GetNobles(msg: Message): Promise<void> {
		try {
			const nobles: IUser[] = await User.GetNobles();

			const buckEmbed: MessageEmbed = new MessageEmbed();
			buckEmbed.setColor(Colors.green);
			buckEmbed.setDescription("Here Are The 3 Richest Members");
			nobles.forEach((noble, i) => buckEmbed.addField(`${i + 1}. ${noble.username}`, `$${noble.billyBucks}`));

			msg.reply(buckEmbed);
		} catch (error) {
			const errorEmbed: MessageEmbed = new MessageEmbed();
			errorEmbed.setColor(Colors.red).setTitle("Error");
			errorEmbed.setDescription(error.message);
			msg.reply(errorEmbed);
		}
	}
}