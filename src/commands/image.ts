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
		await int.deferReply();
		const prompt = getInteractionOptionValue<string>("prompt", int);
		if (prompt.length > 950) throw "Prompt must be no more than 950 characters in length!";
		const waitMsg = await int.channel.send("Generating your image...");
		const res = await Api.post<{ permalink: string }>("images", {
			prompt,
			user_id: int.user.id,
			server_id: int.guild.id
		});
		const embed = Embed.success(null, prompt).setImage(res.permalink);
		await Promise.all([int.editReply({ embeds: [embed] }), waitMsg.delete()]);
	}
};
