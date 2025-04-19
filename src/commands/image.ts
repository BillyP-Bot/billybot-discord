import { ApplicationCommandOptionType, type ChatInputCommandInteraction } from "discord.js";

import { CommandNames } from "@enums";
import { Api, Embed, getInteractionOptionValue } from "@helpers";
import type { ISlashCommand } from "@types";

export const imageCommand: ISlashCommand = {
	name: CommandNames.image,
	description: "Get an AI-generated image based on your input",
	options: [
		{
			name: "prompt",
			description: "The word or phrase to generate the image based on",
			type: ApplicationCommandOptionType.String,
			max_length: 950,
			required: true
		}
	],
	handler: async (int: ChatInputCommandInteraction) => {
		await int.deferReply();
		const prompt = getInteractionOptionValue<string>("prompt", int);
		const embed = await image(int.guild.id, int.user.id, prompt);
		await int.editReply({ embeds: [embed] });
	}
};

const image = async (server_id: string, user_id: string, prompt: string) => {
	if (prompt.length > 950) throw "Prompt must be no more than 950 characters in length!";
	const res = await Api.post<{ permalink: string }>("images", {
		prompt,
		user_id,
		server_id
	});
	return Embed.success(null, prompt).setImage(res.permalink);
};
