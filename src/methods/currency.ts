import Discord, { Message, MessageEmbed } from "discord.js";

import { IUser } from "../models/User";
import { User } from "../repositories/UserRepository";
import { Colors } from "../types/Constants";

const buckEmbed: MessageEmbed = new MessageEmbed();
buckEmbed.setColor(Colors.green);

const errorEmbed: MessageEmbed = new MessageEmbed();
errorEmbed.setColor(Colors.red).setTitle("Error");

export const checkBucks = async (msg: Message, prefix: string): Promise<void> => {
	try {
		const param: string[] = msg.content.slice(prefix.length).trim().split(" ");

		if(param[0]) {
			const found: Discord.User = msg.guild.members.cache.find(a => a.user.username.toUpperCase().trim() === param[0].toUpperCase().trim()).user;

			const bucks: number = await User.GetBucks(found.id);

			buckEmbed.setTitle(found.username);
			buckEmbed.setDescription(`${found.username} has ${bucks} BillyBucks!`);

			msg.reply(buckEmbed);
			return;
		}

		const req: string = msg.author.id;
		const bucks: number = await User.GetBucks(req);

		buckEmbed.setTitle(msg.author.username);
		buckEmbed.setDescription(`you have ${bucks} BillyBucks!`);

		msg.reply(buckEmbed);
	} catch (error) {
		errorEmbed.setDescription(error.message);
		msg.reply(errorEmbed);
	}
};

export const getNobles = async (msg: Message): Promise<void> => {
	try {
		const nobles: IUser[] = await User.GetNobles();

		buckEmbed.setDescription("Here Are The 3 Richest Members");
		nobles.forEach((noble, i) => buckEmbed.addField(`${i + 1}. ${noble.username}`, `$${noble.billyBucks}`));

		msg.reply(buckEmbed);
	} catch (error) {
		errorEmbed.setDescription(error.message);
		msg.reply(errorEmbed);
	}
};