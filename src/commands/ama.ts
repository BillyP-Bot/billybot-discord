import { ApplicationCommandOptionType, ChatInputCommandInteraction } from "discord.js";

import { CommandNames } from "@enums";
import { Api, getInteractionOptionValue } from "@helpers";
import { ISlashCommand } from "@types";

export const amaCommand: ISlashCommand = {
	name: CommandNames.ama,
	description: "Ask BillyP anything",
	options: [
		{
			name: "prompt",
			description: "What would you like to ask BillyP?",
			type: ApplicationCommandOptionType.String,
			max_length: 950,
			required: true
		}
	],
	handler: async (int: ChatInputCommandInteraction) => {
		await int.deferReply();
		const prompt = getInteractionOptionValue<string>("prompt", int);
		const output = await ama(int.guild.id, int.user.id, prompt);
		await int.editReply(`> *${prompt}*\n\n${output}`);
	}
};

const ama = async (server_id: string, user_id: string, prompt: string) => {
	const { output } = await Api.post<{ output: string }>("completions", {
		prompt,
		user_id,
		server_id
	});
	return output;
};
