import { Client, Routes } from "discord.js";

import { commands, commandsLookup } from "../commands";
import { config } from "../helpers";
import { DiscordApi } from "./api";

export const registerSlashCommands = async (client: Client) => {
	try {
		await DiscordApi.put(Routes.applicationGuildCommands(client.user.id, config.SERVER_ID), {
			body: commands
		});
		const _guild = (await client.guilds.fetch()).find((a) => a.id === config.SERVER_ID);
		const guild = await _guild.fetch();
		const guildCommands = await guild.commands.fetch();
		guildCommands.forEach(({ name, id }) => {
			commandsLookup[name].id = id;
		});
	} catch (error) {
		throw `Error registering slash commands: ${error}`;
	}
};
