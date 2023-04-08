import type { ChatInputCommandInteraction, Message } from "discord.js";
import { ApplicationCommandOptionType } from "discord.js";

import { Api, Embed, getInteractionOptionValue } from "../helpers";

import type { ICommand } from "../types";
export const imageCommand: ICommand = {
	prefix: /.*!image.*/gim,
	command: "!image",
	description: "Get an AI-generated image based on your input. Usage: `!image [prompt]`",
	handler: async (msg: Message) => {
		const prompt = msg.content.slice("!image".length).trim();
		if (!prompt) throw "Must enter a valid prompt! Usage: `!image [prompt]`";
		if (prompt.length > 950) throw "Prompt must be no more than 950 characters in length!";
		const [waitMsg, res] = await Promise.all([
			msg.channel.send("Generating your image..."),
			Api.post<{ permalink: string }>("images", {
				prompt,
				user_id: msg.author.id,
				server_id: msg.guild.id
			})
		]);
		const embed = Embed.success(null).setImage(res.permalink);
		await Promise.all([waitMsg.delete(), msg.channel.send({ embeds: [embed] })]);
	},
	slash: {
		name: "image",
		description: "Get an AI-generated image based on your input",
		options: [
			{
				name: "prompt",
				description: "The word or phrase to generate the image based on",
				type: ApplicationCommandOptionType.String,
				required: true
			}
		],
		handler: async (int: ChatInputCommandInteraction) => {
			const prompt = getInteractionOptionValue<string>("prompt", int);
			if (prompt.length > 950) throw "Prompt must be no more than 950 characters in length!";
			const waitEmbed = Embed.success("Generating your image...");
			const [replyInt, res] = await Promise.all([
				int.reply({ embeds: [waitEmbed] }),
				Api.post<{ permalink: string }>("images", {
					prompt,
					user_id: int.user.id,
					server_id: int.guild.id
				})
			]);
			const embed = Embed.success(prompt).setImage(res.permalink);
			await replyInt.edit({ embeds: [embed] });
		}
	}
};
