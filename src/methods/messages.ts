import { MessageEmbed, Message, Client, Role, RoleData, TextChannel, GuildEmoji } from "discord.js";

import { Rest } from "../services/rest";
import logger from "../services/logger";

const adminMsgPrefix: string = "!adminMsg";

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

export const adminMsg = async (msg: Message, client: Client): Promise<void> => {
	const adminText: string = msg.content.replace(adminMsgPrefix, "").trim();
	const generalChannel: any = client.channels.cache.find((TextChannel: TextChannel) => TextChannel.name === "general");

	await Rest.Post("logs/newlog", { log: adminText, issuer: msg.author.username });

	const card: MessageEmbed = new MessageEmbed()
		.setColor("#1bb0a2")
		.setTitle("Admin Update")
		.addField(`Update From ${msg.author.username}`, adminText)
		.addField("Rolling Log", "See all changelogs [here](https://btbackend.herokuapp.com/api/logs)");

	return generalChannel.send(card)
		.then(logger.info(`Sent Admin message: ${adminText}`))
		.catch((e: Error) => {
			logger.error(e);
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