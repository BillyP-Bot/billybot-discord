import type { ChatInputCommandInteraction } from "discord.js";
import type { IFunFact } from "btbot-types";

import { Api } from "../helpers";
import { CommandNames } from "../types/enums";

import type { ISlashCommand } from "../types";

export const factCheckCommand: ISlashCommand = {
	name: CommandNames.factcheck,
	description: "Check if the latest Fun Factoid of the Day is true or not",
	handler: async (int: ChatInputCommandInteraction) => {
		const { prompt, fact } = await buildPrompt();
		await int.reply(`Fact-checking the latest Fun Factoid of the Day...\n> *${fact}*`);
		const output = await factCheck(int.user.id, int.guild.id, prompt);
		await int.channel.send(output);
	}
};

const buildPrompt = async () => {
	const { fact } = await Api.get<IFunFact>("facts/latest");
	if (!fact) throw "Error retrieving latest fun factoid!";
	const prompt = `Is the following fact true? ${fact}`;
	return { prompt, fact };
};

const factCheck = async (user_id: string, server_id: string, prompt: string) => {
	const { output } = await Api.post<{ output: string }>("completions", {
		prompt,
		user_id,
		server_id
	});
	return output;
};
