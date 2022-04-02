import { MessageEmbed, Message, Client, Role, RoleData, TextChannel, GuildEmoji, GuildMember, DMChannel, NewsChannel } from "discord.js";

import { Colors } from "../types";
import { Log } from "../services";

export class MessagesMethods {

	private static readonly adminMsgPrefix = "!adminMsg";
	private static readonly billyPUsernames: string[] = ["BT-Bot-Dev", "Billy Prod Bot", "BillyP Bot"];
	
	static GoodBot(msg: Message): void {
		const billyHappy: GuildEmoji = msg.guild.emojis.cache.find((e: GuildEmoji) => e.name === "BillyHappy");
	
		try {
			msg.react(billyHappy);
		} catch (error) {
			Log.Error(error);
		}
	}
	
	static BadBot(msg: Message): void {
		const billyMad: GuildEmoji = msg.guild.emojis.cache.find((e: GuildEmoji) => e.name === "BillyMad");
	
		try {
			msg.react(billyMad);
		} catch (error) {
			Log.Error(error);
		}
	}
	
	static Sheesh(msg: Message): void {
		try {
			msg.channel.send("Sheeeeeeeeeeeeeeeeesssshhhhh...");
		} catch (error) {
			Log.Error(error);
		}
	}
	
	static async AdminMsg(msg: Message, client: Client): Promise<void> {
		const adminText: string = msg.content.replace(MessagesMethods.adminMsgPrefix, "").trim();
		const generalChannels = client.channels.cache.filter((TextChannel: TextChannel) => TextChannel.name === "general");
	
		const card: MessageEmbed = new MessageEmbed()
			.setColor("#1bb0a2")
			.setTitle("Admin Update")
			.addField(`Update From ${msg.author.username}`, adminText);
	
		await Promise.all([
			generalChannels.reduce((acc: Promise<Message>[], channel: TextChannel) => {
				acc.push(channel.send(card));
				return acc;
			}, [])
		]);
	}
	
	static IncludesAndResponse(msg: Message, prompts: string[][]): void {
		const m: string = msg.content.toUpperCase().trim();
	
		prompts.forEach(val => {
			const p = val[0].toUpperCase().trim();
			if ((m.includes(p)) && !msg.author.bot) {
				msg.reply(val[1]);
			}
		});
	}
	
	static MakeRole(msg: Message, roleName: string, roleColor: string): Promise<any> {
		const role: Role = msg.guild.roles.cache.find(role => role.name === roleName);
	
		if (role || role != undefined) {
			return msg.channel.send(`> Role ${roleName} Already Exists`);
		}
	
		msg.guild.roles.create({
			data: {
				name: roleName,
				color: roleColor.toUpperCase(),
			} as RoleData,
			reason: "This Role Must Exist",
		}).catch((e: Error) => Log.Error(e));
		return msg.channel.send(`> Created Role ${roleName}.`);
	}
	
	static GetMentionedGuildMembers(msg: Message): GuildMember[] {
		return msg.mentions.members.array();
	}
	
	static DidSomeoneMentionBillyP(members: GuildMember[]): boolean {
		let toReturn = false;
		members.forEach(member => {
			const index = MessagesMethods.billyPUsernames.indexOf(member.user.username);
			if (index >= 0 && member.user.bot) {
				toReturn = true;
				return;
			}
		});
		return toReturn;
	}
	
	static BillyPoggersReact(msg: Message): void {
		const billyPoggers: GuildEmoji = msg.guild.emojis.cache.find((e: GuildEmoji) => e.name === "BillyPoggers");
		try {
			msg.react(billyPoggers);
		} catch (error) {
			Log.Error(error);
		}
	}
	
	static ReplyWithSuccessEmbed(msg: Message, title: any, body: any): void {
		const successEmbed: MessageEmbed = new MessageEmbed();
		successEmbed.setColor(Colors.green).setTitle(title);
		successEmbed.setDescription(body);
		msg.reply(successEmbed);
	}
	
	static ReplyWithErrorEmbed(msg: Message, error: any): void {
		const errorEmbed: MessageEmbed = new MessageEmbed();
		errorEmbed.setColor(Colors.red).setTitle("Error");
		errorEmbed.setDescription(error);
		msg.reply(errorEmbed);
	}
	
	static SendSuccessEmbed(channel: TextChannel | DMChannel | NewsChannel, title: any, body: any): void {
		const successEmbed: MessageEmbed = new MessageEmbed();
		successEmbed.setColor(Colors.green).setTitle(title);
		successEmbed.setDescription(body);
		channel.send(successEmbed);
	}
	
	static SendErrorEmbed(channel: TextChannel | DMChannel | NewsChannel, error: any): void {
		const errorEmbed: MessageEmbed = new MessageEmbed();
		errorEmbed.setColor(Colors.red).setTitle("Error");
		errorEmbed.setDescription(error);
		channel.send(errorEmbed);
	}
}

