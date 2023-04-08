import type { ChatInputCommandInteraction, GuildMember, Message } from "discord.js";

import type { IUser } from "btbot-types";
import type { ICommand } from "../types";
import { Api, assertDeveloper } from "../helpers";

export const configureCommand: ICommand = {
	prefix: /.*!configure.*/gim,
	command: "!configure",
	description: "Command for admins to prep the server",
	handler: async (msg: Message) => {
		const users = await configureGuildUsers(msg.member);
		await msg.channel.send(`${users.length} user(s) configured`);
	},
	slash: {
		name: "configure",
		description: "Command for admins to prep the server",
		handler: async (int: ChatInputCommandInteraction) => {
			const users = await configureGuildUsers(int.member as GuildMember);
			await int.reply(`${users.length} user(s) configured`);
		}
	}
};

export const configureGuildUsers = async (member: GuildMember) => {
	await assertDeveloper(member);
	await member.guild.fetch();
	const users = member.guild.members.cache.reduce((acc, { user }) => {
		if (user.bot) return acc;
		acc.push({
			server_id: member.guild.id,
			user_id: user.id,
			username: user.username,
			discriminator: user.discriminator,
			avatar_hash: user.avatar
		});
		return acc;
	}, [] as Partial<IUser>[]);
	return Api.post<IUser[]>("users", users);
};
