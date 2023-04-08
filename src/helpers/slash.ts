import { ApplicationCommand, Client, Collection, REST, Routes } from "discord.js";

import { commands } from "../commands";
import { config } from "../helpers/config";

const rest = new REST({ version: "10" }).setToken(config.BOT_TOKEN);

export const slashCommandNameToIdLookup = {} as Record<string, string>;

export const registerSlashCommands = async (client: Client) => {
	try {
		await rest.put(Routes.applicationGuildCommands(client.user.id, config.SERVER_ID), {
			body: commands
		});
		const _guild = (await client.guilds.fetch()).find((a) => a.id === config.SERVER_ID);
		const guild = await _guild.fetch();
		buildSlashCommandNameToIdLookup(await guild.commands.fetch());
	} catch (error) {
		console.log(`Error registering slash commands: ${error}`);
	}
};

const buildSlashCommandNameToIdLookup = (commands: Collection<string, ApplicationCommand>) => {
	if (!slashCommandNameToIdLookup || Object.keys(slashCommandNameToIdLookup).length === 0) {
		commands.forEach((command) => {
			slashCommandNameToIdLookup[command.name] = command.id;
		});
	}
};
