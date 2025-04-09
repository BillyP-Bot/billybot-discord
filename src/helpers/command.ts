import { ChatInputCommandInteraction } from "discord.js";

import { commandsLookup } from "@commands";

export const getInteractionOptionValue = <T>(
	optionName: string,
	int: ChatInputCommandInteraction,
	defaultValue?: T
) => {
	return (int.options.get(optionName)?.value ?? defaultValue) as T;
};

export const mentionCommand = (name: string, subcommandName?: string) => {
	const id = commandsLookup[name].id;
	if (!id) return `\`/${name}${subcommandName ? ` ${subcommandName}` : ""}\``;
	return `</${name}${subcommandName ? ` ${subcommandName}` : ""}:${id}>`;
};
