import { EmbedBuilder, TextChannel } from "discord.js";

import { Colors } from "../types/enums";
import { ICommand } from "../types/index";
import { PaginatedEmbed } from "./pagination";

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
};

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
