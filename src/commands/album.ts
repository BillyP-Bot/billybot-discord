import type { ChatInputCommandInteraction, TextChannel } from "discord.js";
import { ApplicationCommandOptionType } from "discord.js";

import { Api, getInteractionOptionValue, getUserIdFromMentionOrUsername } from "../helpers";
import { sendPaginatedImageList } from "../helpers/embed";
import { CommandNames } from "../types/enums";

import type { ISlashCommand } from "../types";
import type { IOpenAiImage } from "btbot-types";

export const albumCommand: ISlashCommand = {
	name: CommandNames.album,
	description: "View an album of your (or another user's) previously generated images",
	options: [
		{
			name: "user",
			description: "The @mention or username of the user (runs on self if omitted)",
			type: ApplicationCommandOptionType.String
		}
	],
	handler: async (int: ChatInputCommandInteraction) => {
		await int.deferReply();
		const user = getInteractionOptionValue<string>("user", int);
		const userId = user ? getUserIdFromMentionOrUsername(user, int.guild) : int.user.id;
		const isSelf = int.user.id === userId;
		const res = await album(userId, int.guild.id);
		if (!res || res.length === 0) {
			int.editReply(
				`${isSelf ? "You have" : `<@${userId}> has`} not generated any images yet!`
			);
		}
		await int.editReply(`${isSelf ? "Your" : `<@${userId}>'s`} Images:`);
		await sendPaginatedImageList(res, int.user.id, int.channel as TextChannel);
	}
};

const album = async (user_id: string, server_id: string) => {
	return Api.get<IOpenAiImage[]>(`images?server_id=${server_id}&user_id=${user_id}`);
};
