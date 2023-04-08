import type { ChatInputCommandInteraction } from "discord.js";

import type { ISlashCommand } from "../types";
import { CommandNames } from "../types/enums";

export const bingCommand: ISlashCommand = {
	name: CommandNames.bing,
	description: "bong?",
	handler: async (int: ChatInputCommandInteraction) => {
		await int.reply("bong");
	}
};
