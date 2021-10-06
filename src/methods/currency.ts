import Discord, { Message, Collection, GuildMember, MessageEmbed, Client, Guild, Role, MessageReaction } from "discord.js";

import { UserRepository as User } from "../repositories/UserRepository";
import { User as IUser } from "../models/User";
import { Colors, Roles } from "../types/Constants";
import { IUserList } from "../types/Abstract";

import logger from "../services/logger";

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

	public static async GetNobles(msg: Message): Promise<void> {
		try {
			const nobles: IUser[] = await User.GetNobles(msg.guild.id);

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

	public static async BuckReact(react: MessageReaction, userId: string): Promise<void> {
		try {
			const guildId: string = react.message.guild.id;
			const authorId: string = react.message.author.id;
			//check configured
			await User.GetBucks(authorId, react.message.guild.id);
			const user$: number = await User.GetBucks(userId, react.message.guild.id);
			if (user$ > 0) {
				await User.UpdateBucks(authorId, guildId, 1, true);
				await User.UpdateBucks(userId, guildId, -1, true);
			}
		}
		catch (error) {
			if (error === "user not found")
				logger.warn(error);
			else 
				logger.error(error);
		}
	}

	public static async BillyPay(msg: Message, prefix: string, mention: GuildMember){
		try {
			const username: string = msg.content.substring(prefix.length, msg.content.lastIndexOf(" ")).trim();
			const payAmount: string = msg.content.substring(msg.content.lastIndexOf(" ")).trim();
			const buckEmbed: MessageEmbed = new MessageEmbed();
			const userBucks: number = await User.GetBucks(msg.author.id, msg.guild.id);

			if (username || mention) {
				const found: Discord.GuildMember = mention ? mention : msg.guild.members.cache.find(a => a.user.username.toUpperCase() === username.toUpperCase().trim());
				if (!found) {
					buckEmbed.setColor(Colors.red);
					buckEmbed.setTitle("Error");
					buckEmbed.setDescription(`Could not find ${username} in this server.`);
						
					msg.reply(buckEmbed);
				}
				else {
					if (payAmount) {
						const user: Discord.User = found.user;
						if (+payAmount > userBucks && +payAmount > 0){
							buckEmbed.setColor(Colors.red).setTitle("Error");
							buckEmbed.setDescription(`You do not have ${payAmount} BillyBucks!`);
							msg.reply(buckEmbed);
						}
						const updated: boolean = await User.UpdateBucks(user.id, msg.guild.id, +payAmount, true);
						const updated2: boolean = await User.UpdateBucks(msg.author.id, msg.guild.id, -payAmount, true);
							
						if (updated && updated2) {
							buckEmbed.setColor(Colors.green);
							buckEmbed.setTitle(user.username);
							buckEmbed.setDescription(`You paid ${user.username} ${payAmount} BillyBucks!`);
		
							msg.reply(buckEmbed);
						}
						return;
					}
				}
			}
		}
		catch (error) {
			const errorEmbed: MessageEmbed = new MessageEmbed();
			errorEmbed.setColor(Colors.red).setTitle("Error");
			errorEmbed.setDescription(error.message);
			msg.reply(errorEmbed);
		}
	}
}