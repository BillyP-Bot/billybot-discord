import type { ChatInputCommandInteraction } from "discord.js";

import type { ISlashCommand } from "../types";
import { Api, Embed } from "../helpers";
import { CommandNames } from "../types/enums";

export const celticsCommand: ISlashCommand = {
	name: CommandNames.celtics,
	description: "Check when the next Celtics game is",
	handler: async (int: ChatInputCommandInteraction) => {
		await int.deferReply();
		const embed = await celtics();
		await int.editReply({ embeds: [embed] });
	}
};

const celtics = async () => {
	const { message } = await Api.get<{ message: string }>("celtics");
	return Embed.success(message + "!", "☘️ Celtics ☘️");
};
