import { PaginatedEmbed } from "./pagination";
import { EmbedBuilder, TextChannel } from "discord.js";

import { Colors } from "../types/enums";
import { ICommand } from "../types/index";

import type { IOpenAiImage } from "btbot-types";

import type { Message } from "discord.js";
export class Embed {
	static success(description: string, title?: string) {
		const embed = new EmbedBuilder();
		embed.setColor(Colors.green);
		title && embed.setTitle(title);
		embed.setDescription(description);
		return embed;
	}

	static error(description: string, title?: string) {
		const embed = new EmbedBuilder();
		embed.setColor(Colors.red).setTitle(title ?? "Error");
		embed.setDescription(description);
		return embed;
	}
}

export const sendPaginatedCommandList = async (commands: ICommand[], msg: Message) => {
	console.log(
		commands.map((c) => {
			return { name: c.command, value: c.description };
		})
	);
	const pagEmbed = new PaginatedEmbed({
		itemsPerPage: 10,
		paginationType: "field",
		showFirstLastBtns: false,
		origUser: msg.author.id
	})
		.setTitles(["Commands"])
		.setFields(
			commands.map((c) => {
				return { name: c.command, value: c.description };
			})
		);

	await pagEmbed.send({ options: { channel: msg.channel as TextChannel } });

	// const embeds = constructCommandsEmbedArray(commands);
	// await new Embeds()
	// 	.setArray(embeds.map((embed) => embed.data))
	// 	.setAuthorizedUsers(msg.author.id)
	// 	.setChannel(msg.channel as TextChannel)
	// 	.setTimeout(60000)
	// 	.build();
};

// const constructCommandsEmbedArray = (commands: ICommand[]) => {
// 	const commandsPerPage = 10;
// 	const pageCount = Math.ceil(commands.length / commandsPerPage);
// 	return commands.reduce((acc, { command, description }) => {
// 		if (!command) return acc;
// 		const lastEmbed = acc[acc.length - 1];
// 		const commandsAdded =
// 			Math.max(acc.length - 1, 0) * commandsPerPage + lastEmbed?.data.fields.length || 0;
// 		if (commandsAdded % commandsPerPage === 0) {
// 			const embed = new EmbedBuilder();
// 			const pageNumber = Math.ceil(commandsAdded / commandsPerPage) + 1;
// 			embed
// 				.setColor(Colors.green)
// 				.setTitle(`Commands (${pageNumber}/${pageCount})`)
// 				.addFields({ name: command, value: description });
// 			acc.push(embed);
// 			return acc;
// 		}
// 		lastEmbed.addFields({ name: command, value: description });
// 		return acc;
// 	}, [] as EmbedBuilder[]);
// };

export const sendPaginatedImageList = async (
	images: IOpenAiImage[],
	msg: Message,
	username: string
) => {
	const pagEmbed = new PaginatedEmbed({
		itemsPerPage: 1,
		paginationType: "description",
		showFirstLastBtns: false,
		origUser: msg.author.id
	})
		.setDescriptions(images.map((i) => i.prompt))
		.setImages(images.map((i) => i.permalink))
		.setAuthors([{ name: username }]);
	await pagEmbed.send({ options: { channel: msg.channel as TextChannel } });
};
