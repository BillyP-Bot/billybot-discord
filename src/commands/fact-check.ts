import type { Message } from "discord.js";
import type { IFunFact } from "btbot-types";

import { Api } from "../helpers";

import type { ICommand } from "../types";
export const factCheckCommand: ICommand = {
	prefix: /.*!factcheck.*/gim,
	command: "!factcheck",
	description: "Check if the latest Fun Factoid of the Day is true or not.",
	handler: async (msg: Message) => {
		const { fact } = await Api.get<IFunFact>("facts/latest");
		if (!fact) throw "Error retrieving latest fun factoid!";
		const prompt = `Is the following fact true? ${fact}`;
		await msg.channel.send(`Fact-checking the latest Fun Factoid of the Day...\n> *${fact}*`);
		const res = await Api.post<{ output: string }>("completions", {
			prompt,
			user_id: msg.author.id,
			server_id: msg.guild.id
		});
		msg.channel.send(res.output);
		return;
	}
};
