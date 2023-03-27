import type { Message } from "discord.js";
import type { IFeature } from "btbot-types";

import { Api, Embed } from "../helpers";
import { config } from "../helpers/config";

import type { ICommand } from "../types";
export const featuresCommand: ICommand = {
	prefix: /.*!feature.*/gim,
	command: "!feature",
	description:
		"Use your BillyBucks to submit a new idea for the BillyBot to the developers! Usage: `!feature [title] *newLine* [details]`",
	handler: async (msg: Message) => {
		const trimmedContent = msg.content.slice("!feature".length).trim();
		const nlPos = trimmedContent.indexOf("\n");
		const title = nlPos === -1 ? trimmedContent : trimmedContent.slice(0, nlPos);
		const body = nlPos === -1 ? "" : trimmedContent.slice(trimmedContent.indexOf("\n"));
		const result = await Api.post<{ feature: IFeature & { billy_bucks: number } }>("features", {
			server_id: msg.guild.id,
			user_id: msg.author.id,
			title: title.trim(),
			body: body.trim()
		});
		const embed = Embed.success(
			`\`${result.feature.title}\` has been posted to the [Dashboard](${config.DASHBOARD_URL}/${msg.guild.id})! \n\nYou now have ${result.billy_bucks} BillyBucks`,
			"Feature Posted"
		);
		msg.channel.send({ embeds: [embed] });
		return;
	}
};
