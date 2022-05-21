import type { Message } from "discord.js";

import { config } from "../helpers/config";

import type { ICommand } from "../types";
import { Api, Embed } from "../helpers";

export const featuresCommand: ICommand = {
	prefix: /.*!requestFeature.*/gmi,
	command: "!requestFeature",
	description: "Use your BillyBucks to submit a new idea for the BillyBot to the developers! Usage: `!requestFeature [title] *newLine* [details]`",
	handler: async (msg: Message) => {
		const trimmedContent = msg.content.slice("!requestFeature".length).trim();
		const title = trimmedContent.slice(0, trimmedContent.indexOf('\n'));
		const body = trimmedContent.slice(trimmedContent.indexOf('\n'));
		const feature = await Api.post("features", {
			server_id: msg.guild.id,
			user_id: msg.author.id,
			title: title.trim(),
			body: body.trim()
		});
		const embed = Embed.success(msg, `\`${feature.title}\` has been posted to the [Dashboard](${config.DASHBOARD_URL}/server/${msg.guild.id})! `, "Feature Posted");
		msg.channel.send(embed);
		return;
	}
};