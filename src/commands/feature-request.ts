import type { ChatInputCommandInteraction } from "discord.js";
import { ApplicationCommandOptionType } from "discord.js";

import { Api, Embed, getInteractionOptionValue } from "../helpers";
import { config } from "../helpers/config";
import { CommandNames } from "../types/enums";

import type { IFeature } from "btbot-types";

import type { ISlashCommand } from "../types";

export const featuresCommand: ISlashCommand = {
	name: CommandNames.feature,
	description: "Use your BillyBucks to submit a new idea for the BillyP Bot to the developers",
	options: [
		{
			name: "title",
			description: "The title of the new feature you are requesting",
			type: ApplicationCommandOptionType.String,
			required: true
		},
		{
			name: "details",
			description: "Some more details about the new feature you are requesting",
			type: ApplicationCommandOptionType.String,
			required: true
		}
	],
	handler: async (int: ChatInputCommandInteraction) => {
		await int.deferReply();
		const title = getInteractionOptionValue<string>("title", int);
		const details = getInteractionOptionValue<string>("details", int);
		const embed = await feature(int.guild.id, int.user.id, title, details);
		await int.editReply({ embeds: [embed] });
	}
};

const feature = async (server_id: string, user_id: string, title: string, body: string) => {
	const result = await Api.post<{ feature: IFeature & { billy_bucks: number } }>("features", {
		server_id,
		user_id,
		title: title.trim(),
		body: body.trim()
	});
	return Embed.success(
		`\`${result.feature.title}\` has been posted to the [Dashboard](${config.DASHBOARD_URL}/${server_id})! \n\nYou now have ${result.billy_bucks} BillyBucks`,
		"Feature Posted"
	);
};
