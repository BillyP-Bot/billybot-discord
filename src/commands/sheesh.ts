import type { Message } from "discord.js";

import type { ICommand } from "../types";

export const sheeshCommand: ICommand = {
	prefix: /.*!s+h+ee+s+h+.*/gim,
	command: "!sheesh",
	description: "Sometimes you just need a sheeeeeeeeessshhh...",
	handler: async (msg: Message) => {
		const match = msg.content.match(/!s+h+ee+s+h+/gim)[0];
		let e = "";
		for (let i = 0; i < match.length; i++) e += "e";
		await msg.channel.send(`Shee${e}ssshhh...`);
		return;
	}
};
