import { IOpenAiImage } from "btbot-types";
import { ColorResolvable, EmbedBuilder, TextChannel } from "discord.js";
import { PaginatedEmbed } from "embed-paginator";

import { Colors } from "@enums";

export class Embed {
	static success(description?: string, title?: string, color?: ColorResolvable) {
		const embed = new EmbedBuilder();
		embed.setColor(color ?? Colors.green);
		title && embed.setTitle(title);
		embed.setDescription(description);
		return embed;
	}

	static error(description?: string, title?: string) {
		const embed = new EmbedBuilder();
		embed.setColor(Colors.red).setTitle(title ?? "Error");
		embed.setDescription(description);
		return embed;
	}
}

export const sendPaginatedImageList = async (images: IOpenAiImage[], channel: TextChannel) => {
	const pagEmbed = new PaginatedEmbed({
		itemsPerPage: 1,
		paginationType: "description",
		showFirstLastBtns: true,
		useEmoji: true
	})
		.setDescriptions(images.map(() => " "))
		.setImages(images.map((i) => i.permalink))
		.setTitles(images.map((i) => i.prompt));
	await pagEmbed.send({ options: { channel } });
};
