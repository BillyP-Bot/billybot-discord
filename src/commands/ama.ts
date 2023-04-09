import type { ChatInputCommandInteraction } from "discord.js";
import { ApplicationCommandOptionType } from "discord.js";

import { Api, getInteractionOptionValue } from "../helpers";
import { CommandNames } from "../types/enums";

import type { ISlashCommand } from "../types";
export const amaCommand: ISlashCommand = {
	name: CommandNames.ama,
	description: "Ask BillyP anything",
	options: [
		{
			name: "prompt",
			description: "What would you like to ask BillyP?",
			type: ApplicationCommandOptionType.String,
			maxLength: 950,
			required: true
		}
	],
	handler: async (int: ChatInputCommandInteraction) => {
		await int.deferReply();
		const prompt = getInteractionOptionValue<string>("prompt", int);
		const res = await Api.post<{ output: string }>("completions", {
			prompt,
			user_id: int.user.id,
			server_id: int.guild.id
		});
		await int.editReply(res.output);
	}
};
