import type { IUser } from "btbot-types";
import type { ChatInputCommandInteraction } from "discord.js";

import { CommandNames } from "@enums";
import { Api, Embed } from "@helpers";
import type { ISlashCommand } from "@types";

export const serfsCommand: ISlashCommand = {
	name: CommandNames.serfs,
	description: "Get the 3 poorest users in the server",
	handler: async (int: ChatInputCommandInteraction) => {
		await int.deferReply();
		const embed = await serfs(int.guild.id);
		await int.editReply({ embeds: [embed] });
	}
};

const serfs = async (server_id: string) => {
	const users = await Api.get<IUser[]>(`bucks/serfs/${server_id}`);
	const description = users.reduce((acc, { user_id, billy_bucks }, i) => {
		const newAcc = `${acc}**${i + 1}.** <@${user_id}> ${billy_bucks} BillyBucks\n\n`;
		return newAcc;
	}, "");
	return Embed.success(description, "Serfs");
};
