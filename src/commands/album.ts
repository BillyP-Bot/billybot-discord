import type { Message } from "discord.js";

import type { ICommand } from "../types";
import type { IOpenAiImage } from "btbot-types";

import { Api } from "../helpers";
import { sendPaginatedImageList } from "../helpers/embed";

export const albumCommand: ICommand = {
	prefix: /.*!album.*/gim,
	command: "!album",
	description: "View an album of all of your previously generated images.",
	handler: async (msg: Message) => {
		const res = await Api.get<IOpenAiImage[]>(
			`images?server_id=${msg.guild.id}&user_id=${msg.author.id}`
		);
		if (!res || res.length === 0) {
			msg.reply(
				"You have not generated any images yet! Run `!image [prompt]` to generate an image."
			);
			return;
		}
		await sendPaginatedImageList(res, msg);
		return;
	}
};
