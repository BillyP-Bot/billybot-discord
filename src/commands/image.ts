import type { Message } from "discord.js";

import type { ICommand } from "../types";
import { Api, Embed } from "../helpers";

export const imageCommand: ICommand = {
	prefix: /.*!image.*/gim,
	command: "!image",
	description: "Get an AI-generated image based on your input! Usage: `!image [prompt]`",
	handler: async (msg: Message) => {
		const prompt = msg.content.slice("!image".length).trim();
		if (!prompt) throw "Must enter a valid prompt! Usage: `!image [prompt]`";
		if (prompt.length > 1000) throw "Prompt must be no more than 1000 characters in length!";
		msg.channel.send("Generating your image...");
		const res = await Api.post<{ permalink: string }>("image", {
			prompt,
			user_id: msg.author.id,
			server_id: msg.guild.id
		});
		const embed = Embed.success("").setImage(res.permalink);
		msg.channel.send(embed);
		return;
	}
};
