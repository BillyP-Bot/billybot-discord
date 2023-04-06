import { REST, Routes } from "discord.js";

import { commands } from "../commands";
import { config } from "../helpers/config";

export const slashCommands = commands
	.filter((command) => command.slash)
	.map((command) => command.slash);

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
