import type { Message } from "discord.js";

import type { ICommand } from "../types";
import { Api } from "../helpers";

export const amaCommand: ICommand = {
	prefix: /.*!ama.*/gim,
	command: "!ama",
	description: "Ask Bill anything! Usage: `!ama [prompt]`",
	handler: async (msg: Message) => {
		const prompt = msg.content.slice("!ama".length).trim();
		if (!prompt) throw "Must enter a valid prompt! Usage: `!ama [prompt]`";
		if (prompt.length > 950) throw "Prompt must be no more than 950 characters in length!";
		const [waitMsg, res] = await Promise.all([
			msg.channel.send("Generating response..."),
			Api.post<{ output: string }>("completions", {
				prompt,
				user_id: msg.author.id,
				server_id: msg.guild.id
			})
		]);
		waitMsg.delete();
		msg.channel.send(res.output);
		return;
	}
};
