import { Message, MessageEmbed } from "discord.js";

import { BtBackend } from "../services/rest";
import { ICommandHandler } from "../types";

export default {
	case: "noblemen",
	requiredArgs: false,
	arguments: [],
	properUsage: "!noblemen",
	resolver: async (msg: Message) => {
		const buckEmbed = new MessageEmbed();
		buckEmbed.setColor("GREEN");
		buckEmbed.setDescription("Here Are The 3 Richest Members");

		const { data } = await BtBackend.Client.get("server/nobles", {
			params: {
				serverId: msg.guild.id
			}
		});
		const { users } = data;

		users.forEach(({
			username,
			billy_bucks
		}: { username: string, billy_bucks: string }, i: number) =>
			buckEmbed.addField(`${i + 1}. ${username}`, `$${billy_bucks}`));

		await msg.channel.send({ embeds: [buckEmbed] });
	}
} as ICommandHandler;