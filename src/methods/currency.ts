import Discord, { Message, Collection, GuildMember, MessageEmbed, Client, Guild, Role, MessageReaction } from "discord.js";

import { UserRepository as User } from "../repositories/UserRepository";
// import { User as IUser } from "../models/User";
import { Colors, Roles } from "../types/Constants";
// import { IUserList } from "../types/Abstract";
import { BtBackend } from "../services/rest";

import logger from "../services/logger";

export interface IUser {
	username: string,
	user_id: string,
	server_id: string,
	billy_bucks?: number,
	last_allowance?: string,
	creditScore?: number,
	has_active_loan?: boolean,
	in_lottery?: boolean
}

export default class Currency {

	public static async Configure(client: Client, msg: Message): Promise<void> {
		try {
			const devRole: Role = msg.member.roles.cache.find(a => a.name == Roles.billyDev);
			if (!devRole) throw "user permission denied";

			const users: Partial<IUser>[] = [];

			const serverId: string = msg.guild.id;
			const _guild: Guild = await client.guilds.fetch(serverId);

			const members: Collection<string, Discord.GuildMember> = await _guild.members.fetch();
			const notBots: Collection<string, GuildMember> = members.filter(a => a.user.bot == false);

			notBots.forEach(({ user }) => {
				users.push({
					username: user.username,
					user_id: user.id,
					server_id: serverId
				});
			});

			const { data } = await BtBackend.Client.post("users", { users });
			const { inserted } = data;
			msg.reply(`configuration done! ${inserted} users updated.`);
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
					return;
				}
				const { user: _user } = found;
				const { user } = await (await BtBackend.Client.get(`user/${_user.id}/bucks`, { params: { serverId: msg.guild.id } })).data;
				buckEmbed.setColor(Colors.green);
				buckEmbed.setTitle(user.username);
				buckEmbed.setDescription(`${user.username} has ${user.billy_bucks} BillyBucks!`);
				msg.reply(buckEmbed);
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
			const { data } = await BtBackend.Client.get("server/nobles", {
				params: {
					serverId: msg.guild.id
				}
			});
			const { users } = data;
			const buckEmbed: MessageEmbed = new MessageEmbed();
			buckEmbed.setColor(Colors.green);
			buckEmbed.setDescription("Here Are The 3 Richest Members");
			users.forEach(({
				username,
				billy_bucks
			}: { username: string, billy_bucks: string }, i: number) =>
				buckEmbed.addField(`${i + 1}. ${username}`, `$${billy_bucks}`));
			msg.reply(buckEmbed);
		} catch (error) {
			const errorEmbed: MessageEmbed = new MessageEmbed();
			errorEmbed.setColor(Colors.red).setTitle("Error");
			errorEmbed.setDescription(error.message);
			msg.reply(errorEmbed);
		}
	}

	public static async BuckReact({ message }: MessageReaction, userId: string): Promise<void> {
		try {
			const { data } = await BtBackend.Client.put("user/pay", {
				server: message.guild.id,
				amount: 1,
				payerId: userId,
				recipientId: message.author.id
			});
			console.log(data);
		}
		catch (error) {
			if (error === "user not found")
				logger.warn(error);
			else
				logger.error(error);
		}
	}

	public static async BillyPay(msg: Message, prefix: string, mention: GuildMember) {
		try {
			const username: string = msg.content.substring(prefix.length, msg.content.lastIndexOf(" ")).trim();
			const payAmount: string = msg.content.substring(msg.content.lastIndexOf(" ")).trim();
			const buckEmbed: MessageEmbed = new MessageEmbed();

			if (username || mention) {
				if (username === msg.author.username || (mention && mention.user.username === msg.author.username)) {
					buckEmbed.setColor(Colors.red);
					buckEmbed.setTitle("Error");
					buckEmbed.setDescription(`You cannot pay yourself, ${username}!`);

					msg.reply(buckEmbed);
					return;
				}

				const found: Discord.GuildMember = mention ? mention : msg.guild.members.cache.find(a => a.user.username.toUpperCase() === username.toUpperCase().trim());
				if (!found) {
					buckEmbed.setColor(Colors.red);
					buckEmbed.setTitle("Error");
					buckEmbed.setDescription(`Could not find ${username} in this server.`);

					msg.reply(buckEmbed);
					return;
				}
				if (payAmount) {
					const user: Discord.User = found.user;
					try {
						const { data } = await BtBackend.Client.put("user/pay", {
							server: msg.guild.id,
							amount: +payAmount,
							payerId: msg.author.id,
							recipientId: user.id
						});
						if (!data.payment) return;
						buckEmbed.setColor(Colors.green);
						buckEmbed.setTitle(user.username);
						buckEmbed.setDescription(`You paid ${user.username} ${payAmount} BillyBucks!`);
						msg.reply(buckEmbed);
					} catch (error) {
						buckEmbed.setColor(Colors.red).setTitle("Error");
						buckEmbed.setDescription(
							error.response.data.error == "not enough bucks to pay"
								? `You do not have ${payAmount} BillyBucks!`
								: error
						);
						msg.reply(buckEmbed);
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