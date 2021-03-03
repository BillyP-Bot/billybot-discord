import { Message, MessageEmbed } from "discord.js";

import { Colors, CommandDescriptor } from "../types/Constants";

export default class Generic {

	public static Help(msg: Message): void {
		try {
			//if(msg.author.bot) return;

			const helpEmbed: MessageEmbed = new MessageEmbed();
			helpEmbed.setColor(Colors.green);
			helpEmbed.setTitle("Commands");
			CommandDescriptor.forEach(obj => {
				helpEmbed.addField(obj.prefix, obj.description);
			});
			helpEmbed.setDescription("Here is a list of my commands!");
			msg.reply(helpEmbed);
		} catch (error) {
			const errorEmbed: MessageEmbed = new MessageEmbed();
			errorEmbed.setColor(Colors.red).setTitle("Error");
			errorEmbed.setDescription(error);
			msg.reply(errorEmbed);
			return;
		}
	}
}