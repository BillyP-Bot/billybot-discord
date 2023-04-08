import { ChatInputCommandInteraction } from "discord.js";

import { Api, Embed } from "../helpers";
import { CommandNames } from "../types/enums";

import type { IUser } from "btbot-types";
import type { ISlashCommand } from "../types";
export const serfsCommand: ISlashCommand = {
	name: CommandNames.serfs,
	description: "Get the 3 poorest users in the server",
	handler: async (int: ChatInputCommandInteraction) => {
		const embed = await serfs(int.guild.id);
		await int.reply({ embeds: [embed] });
	}
};

const serfs = async (server_id: string) => {
	const users = await Api.get<IUser[]>(`bucks/serfs/${server_id}`);
	const description = users.reduce((acc, { user_id, billy_bucks }, i) => {
		return (acc += `**${i + 1}.** <@${user_id}> ${billy_bucks} BillyBucks\n\n`);
	}, "");
	return Embed.success(description, "Serfs");
};
