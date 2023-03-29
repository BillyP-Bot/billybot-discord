import { EmbedBuilder, Message } from "discord.js";

import { Api, mapToDisplayName } from "../helpers";
import { Colors } from "../types/enums";

import type { IUser } from "btbot-types";
import type { ICommand } from "../types";
export const serfsCommand: ICommand = {
	prefix: /.*!serfs.*/gim,
	command: "!serfs",
	description: "Get the 3 poorest users in the server.",
	handler: async (msg: Message) => {
		const users = await Api.get<IUser[]>(`bucks/serfs/${msg.guild.id}`);
		const lookup = await mapToDisplayName(msg, users);
		const embed = new EmbedBuilder();
		embed.setColor(Colors.green);
		embed.setDescription(`Here Are The ${users.length} Poorest Members`);
		users.map((user, i) =>
			embed.addFields({
				name: `${i + 1}. ${lookup[user.user_id]}`,
				value: `$${user.billy_bucks}`
			})
		);
		msg.channel.send({ embeds: [embed] });
		return;
	}
};
