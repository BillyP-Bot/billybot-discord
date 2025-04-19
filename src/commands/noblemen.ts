import type { IUser } from "btbot-types";
import type { ChatInputCommandInteraction } from "discord.js";

import { CommandNames } from "@enums";
import { Api, Embed } from "@helpers";
import type { ISlashCommand } from "@types";

export const noblemenCommand: ISlashCommand = {
	name: CommandNames.noblemen,
	description: "Get the 3 richest users in the server",
	handler: async (int: ChatInputCommandInteraction) => {
		await int.deferReply();
		const embed = await noblemen(int.guild.id);
		await int.editReply({ embeds: [embed] });
	}
};

const noblemen = async (server_id: string) => {
	const users = await Api.get<IUser[]>(`bucks/noblemen/${server_id}`);
	const description = users.reduce((acc, { user_id, billy_bucks }, i) => {
		const newAcc = `${acc}**${i + 1}.** <@${user_id}> ${billy_bucks} BillyBucks\n\n`;
		return newAcc;
	}, "");
	return Embed.success(description, "Noblemen");
};
