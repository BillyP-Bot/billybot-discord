import { type ApplicationCommand, type Client, REST, Routes } from "discord.js";

import { commands, commandsLookup } from "@commands";
import { config } from "@helpers";

export const registerSlashCommands = async (client: Client) => {
	try {
		const DiscordApi = new REST({ version: "10" }).setToken(config.BOT_TOKEN);
		await DiscordApi.put(Routes.applicationCommands(client.user.id), {
			body: commands
		});
		const applicationCommands = (await DiscordApi.get(
			Routes.applicationCommands(client.user.id)
		)) as ApplicationCommand[];
		applicationCommands.forEach(({ name, id }) => {
			commandsLookup[name].id = id;
		});
	} catch (error) {
		throw `Error registering slash commands: ${error}`;
	}
};
