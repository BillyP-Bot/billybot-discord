import { IOpenAiImage } from "btbot-types";
import { ApplicationCommandOptionType, ChatInputCommandInteraction, TextChannel } from "discord.js";

import { CommandNames } from "@enums";
import { Api, getInteractionOptionValue, sendPaginatedImageList } from "@helpers";
import { ISlashCommand } from "@types";

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
		await sendPaginatedImageList(res, int.channel as TextChannel);
	}
};

const album = async (server_id: string, user_id: string) => {
	return Api.get<IOpenAiImage[]>(`images?server_id=${server_id}&user_id=${user_id}`);
};
