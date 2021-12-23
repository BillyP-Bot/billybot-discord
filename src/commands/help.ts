import { Message, MessageEmbed } from "discord.js";

import { CommandDescriptor } from "../types/Constants";
import { ICommandHandler } from "../types";

export default {
	case: "help",
	requiredArgs: false,
	arguments: [],
	properUsage: "!help",
	resolver: async (msg: Message) => {
		const helpEmbed = new MessageEmbed();
		helpEmbed.setColor("GREEN");
		helpEmbed.setTitle("Commands");
		CommandDescriptor.forEach(({ prefix, description }) => {
			helpEmbed.addField(prefix, description);
		});
		helpEmbed.setDescription("Here is a list of my commands!");
		await msg.reply({ embeds: [helpEmbed] });
	}
} as ICommandHandler;