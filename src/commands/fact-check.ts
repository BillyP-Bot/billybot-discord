import type { ChatInputCommandInteraction } from "discord.js";
import type { IFunFact } from "btbot-types";

import { Api } from "../helpers";
import { CommandNames } from "../types/enums";

import type { ISlashCommand } from "../types";

export const factCheckCommand: ISlashCommand = {
	name: CommandNames.factcheck,
	description: "Check if the latest Fun Factoid of the Day is true or not",
	handler: async (int: ChatInputCommandInteraction) => {
		await int.deferReply();
		const { prompt, fact } = await buildPrompt();
		const waitMsg = await int.channel.send(
			`> *${fact}*\n\nFact-checking the latest Fun Factoid of the Day...`
		);
		const { output } = await factCheck(int.guild.id, int.user.id, prompt);
		await Promise.all([int.editReply(`> *${fact}*\n\n${output}`), waitMsg.delete()]);
	}
};

const buildPrompt = async () => {
	const { fact } = await Api.get<IFunFact>("facts/latest");
	if (!fact) throw "Error retrieving latest fun factoid!";
	const prompt = `Is the following fact true? ${fact}`;
	return { prompt, fact };
};

const factCheck = async (server_id: string, user_id: string, prompt: string) =>
	Api.post<{ output: string }>("completions", {
		prompt,
		user_id,
		server_id
	});
