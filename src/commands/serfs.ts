import { Message, MessageEmbed } from "discord.js";

import type { ICommand, IUser } from "../types";
import { Api, mapToDisplayName } from "../helpers";
import { Colors } from "../types/enums";

export const serfsCommand: ICommand = {
	prefix: /.*!serfs.*/gmi,
	command: "!serfs",
	description: "Get the 3 poorest users in the server.",
	handler: async (msg: Message) => {
		const users = await Api.get<IUser[]>(`bucks/serfs/${msg.guild.id}`);
		const lookup = mapToDisplayName(msg, users);
		const embed = new MessageEmbed();
		embed.setColor(Colors.green);
		embed.setDescription(`Here Are The ${users.length} Poorest Members`);
		users.map((user, i) => embed.addField(`${i + 1}. ${lookup[user.user_id]}`, `$${user.billy_bucks}`));
		msg.channel.send(embed);
		return;
	}
};