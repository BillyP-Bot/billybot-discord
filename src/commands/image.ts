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
		const res = await Api.post<{ image_url: string }>("image", { prompt });
		const embed = Embed.success("").setImage(res.image_url);
		msg.channel.send(embed);
		return;
	}
};
