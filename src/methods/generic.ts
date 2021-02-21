import { Message, MessageEmbed } from "discord.js";

import { Colors, CommandDescriptor } from "../types/Constants";

export default class Generic {

	public static async Help(msg: Message): Promise<void> {
		try {
			const helpEmbed: MessageEmbed = new MessageEmbed();
			helpEmbed.setColor(Colors.green);
			helpEmbed.setTitle("Commands");
			CommandDescriptor.forEach(obj => {
				helpEmbed.addField(obj.prefix, obj.description);
			});
			helpEmbed.setDescription("Here is a lsit of my commands!");
			msg.reply(helpEmbed);
			return;
		} catch (error) {
			const errorEmbed: MessageEmbed = new MessageEmbed();
			errorEmbed.setColor(Colors.red).setTitle("Error");
			errorEmbed.setDescription(error);
			msg.reply(errorEmbed);
		}
	}
}