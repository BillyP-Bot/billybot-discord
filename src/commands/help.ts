import { ChatInputCommandInteraction } from "discord.js";
import { PaginatedEmbed } from "embed-paginator";

import { commands } from "@commands";
import { CommandNames } from "@enums";
import { mentionCommand } from "@helpers";
import { ISlashCommand } from "@types";

export const helpCommand: ISlashCommand = {
	name: CommandNames.help,
	description: "Show a complete list of supported commands for this server",
	handler: async (int: ChatInputCommandInteraction) => {
		const sortedCommands = commands.sort((a, b) => {
			if (a.name < b.name) return -1;
			if (a.name > b.name) return 1;
			return 0;
		});
		const descriptions = sortedCommands.reduce((acc, { name, description }) => {
			acc.push(`${mentionCommand(name)}\n${description}\n`);
			return acc;
		}, [] as string[]);
		const pagEmbed = new PaginatedEmbed({
			itemsPerPage: 10,
			paginationType: "description",
			showFirstLastBtns: true,
			useEmoji: true
		})
			.setDescriptions(descriptions)
			.setTitles(["Commands"]);
		await pagEmbed.send({ options: { interaction: int } });
	}
};
