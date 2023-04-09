import type { ChatInputCommandInteraction, GuildMember } from "discord.js";

import type { IUser } from "btbot-types";
import type { ISlashCommand } from "../types";
import { Api, assertDeveloper } from "../helpers";
import { CommandNames } from "../types/enums";

export const configureCommand: ISlashCommand = {
	name: CommandNames.configure,
	description: "Command for admins to prep the server",
	handler: async (int: ChatInputCommandInteraction) => {
		await int.deferReply();
		const users = await configureGuildUsers(int.member as GuildMember);
		await int.editReply(`${users.length} user(s) configured`);
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
