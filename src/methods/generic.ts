import { Message, MessageEmbed } from "discord.js";

import { Colors, CommandDescriptor } from "../types/Constants";

export default class Generic {

	private static helpEmbed: MessageEmbed = new MessageEmbed();

	public static async Help(msg: Message): Promise<void> {
		try {
			Generic.helpEmbed.setColor(Colors.green);
			Generic.helpEmbed.setTitle("Commands");
			CommandDescriptor.forEach(obj => {
				Generic.helpEmbed.addField(obj.prefix, obj.description);
			});
			Generic.helpEmbed.setDescription("Here is a list of my commands!");
			msg.reply(Generic.helpEmbed);
			return;
		} catch (error) {
			const errorEmbed: MessageEmbed = new MessageEmbed();
			errorEmbed.setColor(Colors.red).setTitle("Error");
			errorEmbed.setDescription(error);
			msg.reply(errorEmbed);
			return;
		}
	}
}