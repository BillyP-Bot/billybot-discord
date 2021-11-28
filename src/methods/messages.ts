import { MessageEmbed, Message, Client, Role, RoleData, TextChannel, GuildEmoji, GuildMember } from "discord.js";
import { Colors } from "../types/Constants";

import { Rest } from "../services/rest";
import logger from "../services/logger";

const adminMsgPrefix: string = "!adminMsg";
const billyPUsernames: string[] = ["BT-Bot-Dev", "Billy Prod Bot", "BillyP Bot"];

export const goodBot = (msg: Message): void => {
	const billyHappy: GuildEmoji = msg.guild.emojis.cache.find((e: GuildEmoji) => e.name === "BillyHappy");
	
	try{
		msg.react(billyHappy);
	} catch (error) {
		logger.error(error);
	}
};

export const badBot = (msg: Message): void => {
	const billyMad: GuildEmoji = msg.guild.emojis.cache.find((e: GuildEmoji) => e.name === "BillyMad");
	
	try{
		msg.react(billyMad);
	} catch (error) {
		logger.error(error);
	}
};

export const sheesh = (msg: Message): void => {
	try {
		msg.channel.send("Sheeeeeeeeeeeeeeeeesssshhhhh...");
	} catch (error) {
		logger.error(error);
	}
};

export const adminMsg = async (msg: Message, client: Client): Promise<void> => {
	const adminText: string = msg.content.replace(adminMsgPrefix, "").trim();
	const generalChannels = client.channels.cache.filter((TextChannel: TextChannel) => TextChannel.name === "general");

	await Rest.Post("logs/newlog", { log: adminText, issuer: msg.author.username });

	const card: MessageEmbed = new MessageEmbed()
		.setColor("#1bb0a2")
		.setTitle("Admin Update")
		.addField(`Update From ${msg.author.username}`, adminText)
		.addField("Rolling Log", "See all changelogs [here](https://btbackend.herokuapp.com/api/logs)");

	generalChannels.forEach(async (channel: TextChannel) => {
		await channel.send(card);
	});
};

export const includesAndResponse = (msg: Message, prompts: string[][]): void => {
	const m: string = msg.content.toUpperCase().trim();

	prompts.forEach(val => {
		let p = val[0].toUpperCase().trim();
		if ((m.includes(p)) && !msg.author.bot) {
			msg.reply(val[1]);
		}
	});
};

export const makeRole = (msg: Message, roleName: string, roleColor: string): Promise<any> => {
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
	}).catch((e: Error) => logger.error(e));
	return msg.channel.send(`> Created Role ${roleName}.`);
};

export const getMentionedGuildMembers = (msg: Message): GuildMember[] => {
	return msg.mentions.members.array();
};

export const didSomeoneMentionBillyP = (members: GuildMember[]): boolean => {
	let toReturn = false;
	members.forEach(member => {
		const index = billyPUsernames.indexOf(member.user.username);
		if (index >= 0 && member.user.bot) {
			toReturn = true;
			return;
		}
	});
	return toReturn;
};

export const billyPoggersReact = (msg: Message): void => {
	const billyPoggers: GuildEmoji = msg.guild.emojis.cache.find((e: GuildEmoji) => e.name === "BillyPoggers");
	try {
		msg.react(billyPoggers);
	} catch (error) {
		logger.error(error);
	}
};

export const replyWithSuccessEmbed = (msg: Message, title: any, body: any): void => {
	const successEmbed: MessageEmbed = new MessageEmbed();
	successEmbed.setColor(Colors.green).setTitle(title);
	successEmbed.setDescription(body);
	msg.reply(successEmbed);
};

export const replyWithErrorEmbed = (msg: Message, error: any): void => {
	const errorEmbed: MessageEmbed = new MessageEmbed();
	errorEmbed.setColor(Colors.red).setTitle("Error");
	errorEmbed.setDescription(error);
	msg.reply(errorEmbed);
};