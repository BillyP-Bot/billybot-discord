import type { Guild, Message } from "discord.js";

import type { IUser } from "btbot-types";
import type { ICommand } from "../types";
import { Api, assertDeveloper } from "../helpers";

export const configureCommand: ICommand = {
	prefix: /.*!configure.*/gim,
	command: "!configure",
	description: "Command for admins to prep the server.",
	handler: async (msg: Message) => {
		await assertDeveloper(msg);
		const data = await configureGuildUsers(msg.guild);
		msg.channel.send(`${data.length} user(s) configured`);
		return;
	}
};

export const configureGuildUsers = async (guild: Guild) => {
	await guild.fetch();
	const users = guild.members.cache.reduce((acc, { user }) => {
		if (user.bot) return acc;
		acc.push({
			server_id: guild.id,
			user_id: user.id,
			username: user.username,
			discriminator: user.discriminator,
			avatar_hash: user.avatar
		});
		return acc;
	}, [] as Partial<IUser>[]);
	return Api.post<IUser[]>("users", users);
};
