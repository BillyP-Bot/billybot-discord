import type { ChatInputCommandInteraction, Message } from "discord.js";
import { ApplicationCommandOptionType } from "discord.js";

import { Api, Embed, getInteractionOptionValue } from "../helpers";
import { config } from "../helpers/config";

import type { IFeature } from "btbot-types";

import type { ICommand } from "../types";
export const featuresCommand: ICommand = {
	prefix: /.*!feature.*/gim,
	command: "!feature",
	description:
		"Use your BillyBucks to submit a new idea for the BillyBot to the developers. Usage: `!feature [title] *newLine* [details]`",
	handler: async (msg: Message) => {
		const trimmedContent = msg.content.slice("!feature".length).trim();
		const nlPos = trimmedContent.indexOf("\n");
		const title = nlPos === -1 ? trimmedContent : trimmedContent.slice(0, nlPos);
		const details = nlPos === -1 ? "" : trimmedContent.slice(trimmedContent.indexOf("\n"));
		const embed = await feature(msg.guild.id, msg.author.id, title, details);
		await msg.channel.send({ embeds: [embed] });
	},
	slash: {
		name: "feature",
		description: "Use your BillyBucks to submit a new idea for the BillyBot to the developers",
		options: [
			{
				name: "title",
				description: "The main idea of the new feature you are requesting",
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
			const title = getInteractionOptionValue<string>("title", int);
			const details = getInteractionOptionValue<string>("details", int);
			const embed = await feature(int.guild.id, int.user.id, title, details);
			await int.reply({ embeds: [embed] });
		}
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
