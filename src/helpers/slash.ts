import { ApplicationCommand, Client, Collection, REST, Routes } from "discord.js";

import { commands, commandsLookup } from "../commands";
import { config } from "../helpers/config";

const rest = new REST({ version: "10" }).setToken(config.BOT_TOKEN);

export const registerSlashCommands = async (client: Client) => {
	try {
		await rest.put(Routes.applicationGuildCommands(client.user.id, config.SERVER_ID), {
			body: commands
		});
		const _guild = (await client.guilds.fetch()).find((a) => a.id === config.SERVER_ID);
		const guild = await _guild.fetch();
		const guildCommands = await guild.commands.fetch();
		setCommandIds(guildCommands);
	} catch (error) {
		throw `Error registering slash commands: ${error}`;
	}
};

const setCommandIds = (commands: Collection<string, ApplicationCommand>) => {
	commands.forEach(({ name, id }) => {
		commandsLookup[name].id = id;
	});
};
