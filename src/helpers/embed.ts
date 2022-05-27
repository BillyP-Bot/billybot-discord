import { MessageEmbed } from "discord.js";

import { Colors } from "../types/enums";

import type { Message } from "discord.js";

export class Embed {
	static success(msg: Message, description: string, title?: string) {
		const embed = new MessageEmbed();
		embed.setColor(Colors.green);
		title && embed.setTitle(title);
		embed.setDescription(description);
		return embed;
	}

	static error(msg: Message, description: string, title?: string) {
		const embed = new MessageEmbed();
		embed.setColor(Colors.red).setTitle(title ?? "Error");
		embed.setDescription(description);
		return embed;
	}
}
