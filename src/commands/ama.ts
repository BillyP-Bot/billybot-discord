import type { ChatInputCommandInteraction, Message } from "discord.js";
import { ApplicationCommandOptionType } from "discord.js";

import { Api, getInteractionOptionValue } from "../helpers";

import type { ICommand } from "../types";
export const amaCommand: ICommand = {
	prefix: /.*!ama.*/gim,
	command: "!ama",
	description: "Ask BillyP anything. Usage: `!ama [prompt]`",
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
		await Promise.all([waitMsg.delete(), msg.channel.send(res.output)]);
	},
	slash: {
		name: "ama",
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
			const prompt = getInteractionOptionValue<string>("prompt", int);
			const res = await Api.post<{ output: string }>("completions", {
				prompt,
				user_id: int.user.id,
				server_id: int.guild.id
			});
			await int.reply(res.output);
		}
	}
};
