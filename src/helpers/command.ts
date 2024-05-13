import { ChatInputCommandInteraction, Message } from "discord.js";

import { commandsLookup } from "@commands";
import { Embed } from "@helpers";

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

export const sendLegacyCommandDeprecationNotice = async (msg: Message) => {
	const commandName = msg.content.split(" ")[0].replace("!", "");
	if (!commandsLookup[commandName]) return;
	const description = `Did you mean ${mentionCommand(
		commandName
	)}?\n\nCommands prefixed with \`!\` are no longer supported!\n\nTry prefixing the command with \`/\` instead.`;
	const embed = Embed.error(description, "Oops!");
	await msg.channel.send({ embeds: [embed] });
};
