import { REST, Routes } from "discord.js";

import { commands } from "../commands";
import { config } from "../helpers/config";

export const slashCommands = commands.filter(
	(command) => "name" in command && "slashHandler" in command
);

const rest = new REST({ version: "10" }).setToken(config.BOT_TOKEN);

export const registerSlashCommands = async (clientId: string) => {
	try {
		await rest.put(Routes.applicationGuildCommands(clientId, config.SERVER_ID), {
			body: slashCommands
		});
	} catch (error) {
		console.log(`Error registering slash commands: ${error}`);
	}
};
