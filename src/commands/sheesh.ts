import { ApplicationCommandOptionType, type ChatInputCommandInteraction } from "discord.js";

import { CommandNames } from "@enums";
import { getInteractionOptionValue } from "@helpers";
import type { ISlashCommand } from "@types";

export const sheeshCommand: ISlashCommand = {
	name: CommandNames.sheesh,
	description: "Sometimes you just need a sheeeeeeeeessshhh...",
	options: [
		{
			name: "intensity",
			description: "How intense will your sheesh be?",
			type: ApplicationCommandOptionType.Integer,
			required: false,
			choices: [
				{
					name: "wimpy",
					value: 1
				},
				{
					name: "modest",
					value: 2
				},
				{
					name: "firm",
					value: 3
				},
				{
					name: "vigorous",
					value: 4
				},
				{
					name: "⚠️ unstable ⚠️",
					value: 5
				}
			]
		}
	],
	handler: async (int: ChatInputCommandInteraction) => {
		const intensity = getInteractionOptionValue<number>("intensity", int);
		await int.reply(sheesh(intensity));
	}
};

const sheesh = (intensity: number) => {
	switch (intensity) {
		case 1:
			return "Sheeeeeeeesh...";
		case 2:
			return "Sheeeeeeeeeeeesssshhhh...";
		case 3:
			return "Sheeeeeeeeeeeeeeeeeessssssssshhhhhhhh...";
		case 4:
			return "Sheeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeessssssssssshhhhhh...";
		case 5:
			return (
				"SHEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEE" +
				"EEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEE" +
				"EEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEE" +
				"EEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEESSSSSSSSSSSSSSSSSSSSSSHHHHHHHHHHHHHHHHHHHHHHHHHHHH..."
			);
		default:
			return "Sheeeeeeeesh...";
	}
};
