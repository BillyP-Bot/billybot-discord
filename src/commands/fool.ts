import type { ChatInputCommandInteraction, GuildMember } from "discord.js";
import { ApplicationCommandOptionType } from "discord.js";

import {
	Api,
	assertMayor,
	Embed,
	getInteractionOptionValue,
	getUserIdFromMentionOrUsername,
	readFool
} from "../helpers";
import { CommandNames } from "../types/enums";

import type { ISlashCommand } from "../types";

export const foolCommand: ISlashCommand = {
	name: CommandNames.fool,
	description: "Run by the current mayor to make another user the fool",
	options: [
		{
			name: "user",
			description: "The @mention or username of the user to make the new fool",
			type: ApplicationCommandOptionType.String,
			required: true
		}
	],
	handler: async (int: ChatInputCommandInteraction) => {
		await int.deferReply();
		const user = getInteractionOptionValue<string>("user", int);
		const embed = await fool(int.member as GuildMember, () =>
			user ? getUserIdFromMentionOrUsername(user, int.guild) : int.user.id
		);
		await int.editReply({ embeds: [embed] });
	}
};

const fool = async (member: GuildMember, getTargetUserId: () => string) => {
	await assertMayor(member);
	const { foolRole, currentFool } = await readFool(member.guild);
	const targetUserId = getTargetUserId();
	if (targetUserId === currentFool?.user.id) throw `<@${targetUserId}> is already the fool!`;
	if (targetUserId === member.user.id) throw "You cannot set yourself as the fool!";
	const server_id = member.guild.id;
	await Api.put("users", [
		{
			server_id,
			user_id: targetUserId,
			is_fool: true
		},
		{
			server_id,
			user_id: currentFool?.user.id,
			is_fool: false
		}
	]);
	const targetUser = await member.guild.members.fetch(targetUserId);
	await Promise.all([targetUser.roles.add(foolRole), currentFool?.roles.remove(foolRole)]);
	return Embed.success(`<@${targetUserId}> is now the fool!`, "Mayoral Decree!");
};
