import { ApplicationCommandOptionType, type ChatInputCommandInteraction } from "discord.js";

import { CommandNames } from "@enums";
import { Api, Embed, getInteractionOptionValue } from "@helpers";
import type { ISlashCommand } from "@types";

export const nbaCommand: ISlashCommand = {
	name: CommandNames.nba,
	description: "Check when the next game for any NBA team is",
	options: [
		{
			name: "team",
			description: "The name of the team to look up (defaults to Celtics)",
			type: ApplicationCommandOptionType.String
		}
	],
	handler: async (int: ChatInputCommandInteraction) => {
		await int.deferReply();
		const team = getInteractionOptionValue<string>("team", int, "celtics");
		const embed = await nba(team);
		await int.editReply({ embeds: [embed] });
	}
};

const nba = async (team: string) => {
	const { message } = await Api.get<{ message: string }>(`nba?team=${team}`);
	return Embed.success(message, "Next Game");
};
