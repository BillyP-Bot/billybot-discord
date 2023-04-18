import { IUser } from "btbot-types";
import { ChatInputCommandInteraction, GuildMember } from "discord.js";

import { CommandNames } from "@enums";
import { Api, assertDeveloper } from "@helpers";
import { ISlashCommand } from "@types";

export const configureCommand: ISlashCommand = {
	name: CommandNames.configure,
	description: "Command for admins to prep the server",
	handler: async (int: ChatInputCommandInteraction) => {
		await int.deferReply();
		const users = await configureGuildUsers(int.member as GuildMember, true);
		await int.editReply(`${users.length} user(s) configured`);
	}
};

export const configureGuildUsers = async (member: GuildMember, doAuthCheck?: boolean) => {
	if (doAuthCheck) await assertDeveloper(member);
	const guildMembers = await member.guild.members.fetch();
	const users = guildMembers.reduce((acc, { user }) => {
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
