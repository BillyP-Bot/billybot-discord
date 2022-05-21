import type { Message } from "discord.js";

import { config } from "../helpers/config";

import type { ICommand } from "../types";
import { Api, Embed } from "../helpers";

export const featuresCommand: ICommand = {
	prefix: /.*!feature.*/gmi,
	command: "!feature",
	description: "Use your BillyBucks to submit a new idea for the BillyBot to the developers! Usage: `!feature [title] *newLine* [details]`",
	handler: async (msg: Message) => {
		const trimmedContent = msg.content.slice("!feature".length).trim();
		const title = trimmedContent.slice(0, trimmedContent.indexOf('\n'));
		const body = trimmedContent.slice(trimmedContent.indexOf('\n'));
		const feature = await Api.post("features", {
			server_id: msg.guild.id,
			user_id: msg.author.id,
			title: title.trim(),
			body: body.trim()
		});
		const embed = Embed.success(msg, `\`${feature.title}\` has been posted to the [Dashboard](${config.DASHBOARD_URL}/${msg.guild.id})! `, "Feature Posted");
		msg.channel.send(embed);
		return;
	}
};