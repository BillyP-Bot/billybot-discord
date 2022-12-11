import type { Message } from "discord.js";

import type { ICommand } from "../types";
import type { IOpenAiImage } from "btbot-types";

import { Api, getServerDisplayName } from "../helpers";
import { sendPaginatedImageList } from "../helpers/embed";

export const albumCommand: ICommand = {
	prefix: /.*!album.*/gim,
	command: "!album",
	description:
		"View an album of your (or another user's) previously generated images. Usage: `!album` / `!album [username/@user]`",
	handler: async (msg: Message) => {
		const { name, id } = getServerDisplayName(msg);
		const isSelf = msg.author.id === id;
		const res = await Api.get<IOpenAiImage[]>(`images?server_id=${msg.guild.id}&user_id=${id}`);
		if (!res || res.length === 0) {
			msg.channel.send(
				`${isSelf ? "You have" : `${name} has`} not generated any images yet! ${
					isSelf ? "Run `!image [prompt]` to generate an image." : ""
				}`
			);
			return;
		}
		await sendPaginatedImageList(res, msg);
		return;
	}
};
