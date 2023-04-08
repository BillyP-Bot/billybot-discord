import { ChatInputCommandInteraction } from "discord.js";

import { Api, Embed } from "../helpers";
import { CommandNames } from "../types/enums";

import type { IUser } from "btbot-types";
import type { ISlashCommand } from "../types";

export const noblemenCommand: ISlashCommand = {
	name: CommandNames.noblemen,
	description: "Get the 3 richest users in the server",
	handler: async (int: ChatInputCommandInteraction) => {
		const embed = await noblemen(int.guild.id);
		await int.reply({ embeds: [embed] });
	}
};

const noblemen = async (server_id: string) => {
	const users = await Api.get<IUser[]>(`bucks/noblemen/${server_id}`);
	const description = users.reduce((acc, { user_id, billy_bucks }, i) => {
		return (acc += `**${i + 1}.** <@${user_id}> ${billy_bucks} BillyBucks\n\n`);
	}, "");
	return Embed.success(description, "Noblemen");
};
