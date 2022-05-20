import type { Message } from "discord.js";

import type { IUser } from "btbot-types";
import type { ICommand } from "../types";
import { Api, assertDeveloper } from "../helpers";

export const configureCommand: ICommand = {
	prefix: /.*!configure.*/gmi,
	command: "!configure",
	description: "Command for admins to prep the server.",
	handler: async (msg: Message) => {
		await assertDeveloper(msg);
		await msg.guild.fetch();
		const users = msg.guild.members.cache.reduce((acc, { user }) => {
			if (user.bot) return acc;
			acc.push({
				server_id: msg.guild.id,
				user_id: user.id,
				username: user.username,
				discriminator: user.discriminator,
				avatar_hash: user.avatar
			});
			return acc;
		}, [] as Partial<IUser>[]);
		const data = await Api.post<IUser[]>("users", users);
		msg.channel.send(`${data.length} user(s) configured`);
		return;
	}
};