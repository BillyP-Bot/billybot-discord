import { Message, MessageEmbed } from "discord.js";

import type { ICommand, IUser } from "../types";
import { Api } from "../helpers";
import { Colors } from "../types/enums";

export const noblemenCommand: ICommand = {
	prefix: /.*!noblemen.*/gmi,
	command: "!noblemen",
	description: "Get the 3 richest users in the server.",
	handler: async (msg: Message) => {
		const data = await Api.get<IUser[]>(`bucks/noblemen/${msg.guild.id}`);
		const users = data;
		const embed = new MessageEmbed();
		embed.setColor(Colors.green);
		embed.setDescription(`Here Are The ${users.length} Richest Members`);
		users.map((user, i) => embed.addField(`${i + 1}. ${user.username}`, `$${user.billy_bucks}`));
		msg.channel.send(embed);
		return;
	}
};