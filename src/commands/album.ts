import type { ChatInputCommandInteraction, TextChannel } from "discord.js";
import { ApplicationCommandOptionType } from "discord.js";

import { Api, getInteractionOptionValue } from "../helpers";
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
			description: "The user whose album you want to view (runs on self if omitted)",
			type: ApplicationCommandOptionType.User
		}
	],
	handler: async (int: ChatInputCommandInteraction) => {
		await int.deferReply();
		const userId = getInteractionOptionValue<string>("user", int, int.user.id);
		const onSelf = int.user.id === userId;
		const res = await album(int.guild.id, userId);
		if (!res || res.length === 0) {
			await int.editReply(
				`${onSelf ? "You have" : `<@${userId}> has`} not generated any images yet!`
			);
			return;
		}
		await int.editReply(`${onSelf ? "Your" : `<@${userId}>'s`} Images:`);
		await sendPaginatedImageList(res, int.user.id, int.channel as TextChannel);
	}
};

const album = async (server_id: string, user_id: string) => {
	return Api.get<IOpenAiImage[]>(`images?server_id=${server_id}&user_id=${user_id}`);
};
