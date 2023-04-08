import type { ChatInputCommandInteraction, Message, TextChannel } from "discord.js";
import { ApplicationCommandOptionType } from "discord.js";

import {
	Api,
	getInteractionOptionValue,
	getServerDisplayName,
	getUserIdFromMentionOrUsername
} from "../helpers";
import { sendPaginatedImageList } from "../helpers/embed";

import type { ICommand } from "../types";
import type { IOpenAiImage } from "btbot-types";

export const albumCommand: ICommand = {
	prefix: /.*!album.*/gim,
	command: "!album",
	description:
		"View an album of your (or another user's) previously generated images. Usage: `!album` / `!album [username/@user]`",
	handler: async (msg: Message) => {
		const { id } = getServerDisplayName(msg);
		const isSelf = msg.author.id === id;
		const res = await album(id, msg.guild.id);
		if (!res || res.length === 0) {
			msg.channel.send(
				`${isSelf ? "You have" : `<@${id}> has`} not generated any images yet! ${
					isSelf ? "Run `!image [prompt]` to generate an image." : ""
				}`
			);
		}
		await msg.channel.send(`${isSelf ? "Your" : `<@${id}>'s`} Images:`);
		await sendPaginatedImageList(res, msg.author.id, msg.channel as TextChannel);
		return;
	},
	slash: {
		name: "album",
		description: "View an album of your (or another user's) previously generated images",
		options: [
			{
				name: "user",
				description: "The @mention or username of the user (runs on self if omitted)",
				type: ApplicationCommandOptionType.String
			}
		],
		handler: async (int: ChatInputCommandInteraction) => {
			const user = getInteractionOptionValue<string>("user", int);
			const userId = user ? getUserIdFromMentionOrUsername(user, int.guild) : int.user.id;
			const isSelf = int.user.id === userId;
			const res = await album(userId, int.guild.id);
			if (!res || res.length === 0) {
				int.reply(
					`${isSelf ? "You have" : `<@${userId}> has`} not generated any images yet! ${
						isSelf ? "Run `!image [prompt]` to generate an image." : ""
					}`
				);
			}
			await int.reply(`${isSelf ? "Your" : `<@${userId}>'s`} Images:`);
			await sendPaginatedImageList(res, int.user.id, int.channel as TextChannel);
		}
	}
};

const album = async (user_id: string, server_id: string) => {
	return Api.get<IOpenAiImage[]>(`images?server_id=${server_id}&user_id=${user_id}`);
};
