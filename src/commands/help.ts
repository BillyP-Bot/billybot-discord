import { ApplicationCommandOptionType, type ChatInputCommandInteraction } from "discord.js";

import { commands } from "@commands";
import { CommandNames } from "@enums";
import { PaginatedEmbed, mentionCommand, sortArrayByField } from "@helpers";
import type { ISlashCommand } from "@types";

export const helpCommand: ISlashCommand = {
	name: CommandNames.help,
	description: "Show a complete list of supported commands for this server",
	handler: async (int: ChatInputCommandInteraction) => {
		const sortedCommands = sortArrayByField(commands, "name");
		const descriptions = sortedCommands.reduce((acc, command) => {
			const { name, description, options } = command;
			const subcommands =
				options?.filter(
					option => option.type === ApplicationCommandOptionType.Subcommand
				) ?? [];
			for (const subcommand of subcommands) {
				const { name: subCommandName, description: subCommandDescription } = subcommand;
				acc.push(`${mentionCommand(name, subCommandName)}\n${subCommandDescription}\n`);
			}
			if (subcommands.length === 0) acc.push(`${mentionCommand(name)}\n${description}\n`);
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
		// @ts-ignore
		await pagEmbed.send({ options: { interaction: int } });
	}
};
