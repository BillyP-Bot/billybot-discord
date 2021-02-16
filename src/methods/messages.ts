import { MessageEmbed, Message, Client, Role, RoleData, TextChannel } from "discord.js";
import fetch from "node-fetch";

import { ILogBody } from "../types/Abstract";
import logger from "../services/logger";

const adminMsgPrefix: string = "!adminMsg";

const postLog = (body: ILogBody): Promise<void> => {
	return new Promise((resolve, reject) => {
		fetch("https://btbackend.herokuapp.com/api/logs/newlog", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ log: body.log, issuer: body.issuer })
		}).then(r => r.json())
			.then(data => {
				return resolve(data);
			}).catch(e => {
				reject(e);
			});
	});
};

export const adminMsg = (msg: Message, client: Client): void => {

	if (msg.channel.type === "dm") {
		const adminText: string = msg.content.replace(adminMsgPrefix, "").trim();
		const generalChannel: any = client.channels.cache.find((TextChannel: TextChannel) => TextChannel.name === "general");

		postLog({ log: adminText, issuer: msg.author.username }).then(r => {
			logger.info(r);
			const card: MessageEmbed = new MessageEmbed()
				.setColor("#1bb0a2")
				.setTitle("Admin Update")
				.addField(`Update From ${msg.author.username}`, adminText)
				.addField("Rolling Log", "See all changelogs [here](https://btbackend.herokuapp.com/api/logs)!")
				.addField("Donate", "Contribute [here](https://btbackend.herokuapp.com/api/donate)!");

			return generalChannel.send(card)
				.then(logger.info(`Sent Admin message: ${adminText}`))
				.catch((e: Error) => {
					logger.error(e);
				});
		});

	}
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
