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
		await assertDeveloper(int.member as GuildMember);
		let message = `Creating server record for ${int.guild.name}...\n`;
		try {
			await assertCreateNewServerRecord(int.guildId, int.guild.name, int.guild.icon);
			message += "Server record created\n";
		} catch (error) {
			message += `${error}\n`;
		}
		const users = await configureGuildUsers(int.member as GuildMember);
		message += `${users.length} user(s) configured`;
		await int.editReply(message);
	}
};

const assertCreateNewServerRecord = async (server_id: string, name: string, icon_hash: string) => {
	return Api.post("server", { server_id, name, icon_hash });
};

export const configureGuildUsers = async (member: GuildMember) => {
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
