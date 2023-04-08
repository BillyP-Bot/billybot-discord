import type { ChatInputCommandInteraction } from "discord.js";
import { ApplicationCommandOptionType } from "discord.js";

import { Api, Embed, getInteractionOptionValue } from "../helpers";
import { CommandNames } from "../types/enums";

import type { ISlashCommand } from "../types";

export const imageCommand: ISlashCommand = {
	name: CommandNames.image,
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
};
