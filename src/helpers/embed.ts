import { Embeds } from "discord-paginationembed";
import { MessageEmbed, TextChannel } from "discord.js";

import { Colors } from "../types/enums";
import { ICommand } from "../types/index";

import type { IOpenAiImage } from "btbot-types";

import type { Message } from "discord.js";
export class Embed {
	static success(description: string, title?: string) {
		const embed = new MessageEmbed();
		embed.setColor(Colors.green);
		title && embed.setTitle(title);
		embed.setDescription(description);
		return embed;
	}

	static error(description: string, title?: string) {
		const embed = new MessageEmbed();
		embed.setColor(Colors.red).setTitle(title ?? "Error");
		embed.setDescription(description);
		return embed;
	}
}

export const sendPaginatedCommandList = async (commands: ICommand[], msg: Message) => {
	const embeds = constructCommandsEmbedArray(commands);
	await new Embeds()
		.setArray(embeds)
		.setAuthorizedUsers(msg.author.id)
		.setChannel(msg.channel as TextChannel)
		.setTimeout(60000)
		.build();
};

const constructCommandsEmbedArray = (commands: ICommand[]) => {
	const commandsPerPage = 10;
	const pageCount = Math.ceil(commands.length / commandsPerPage);
	return commands.reduce((acc, { command, description }) => {
		if (!command) return acc;
		const lastEmbed = acc[acc.length - 1];
		const commandsAdded =
			Math.max(acc.length - 1, 0) * commandsPerPage + lastEmbed?.fields.length || 0;
		if (commandsAdded % commandsPerPage === 0) {
			const embed = new MessageEmbed();
			const pageNumber = Math.ceil(commandsAdded / commandsPerPage) + 1;
			embed
				.setColor(Colors.green)
				.setTitle(`Commands (${pageNumber}/${pageCount})`)
				.addField(command, description);
			acc.push(embed);
			return acc;
		}
		lastEmbed.addField(command, description);
		return acc;
	}, [] as MessageEmbed[]);
};

export const sendPaginatedImageList = async (images: IOpenAiImage[], msg: Message) => {
	const embeds = constructAlbumEmbedArray(images, msg.author.username);
	await new Embeds()
		.setArray(embeds)
		.setAuthorizedUsers(msg.author.id)
		.setChannel(msg.channel as TextChannel)
		.setTimeout(60000)
		.build();
};

const constructAlbumEmbedArray = (images: IOpenAiImage[], username: string) => {
	return images.reduce((acc, { prompt, permalink }, index) => {
		if (!prompt || !permalink) return acc;
		const embed = new MessageEmbed();
		embed
			.setColor(Colors.green)
			.setTitle(`${username}'s Images (${index + 1}/${images.length})`)
			.setDescription(prompt)
			.setImage(permalink);
		acc.push(embed);
		return acc;
	}, [] as MessageEmbed[]);
};
