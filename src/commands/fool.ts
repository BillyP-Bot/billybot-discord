import type { ChatInputCommandInteraction, GuildMember, Message } from "discord.js";
import { ApplicationCommandOptionType } from "discord.js";

import {
	Api,
	assertMayor,
	Embed,
	getFirstMentionOrSelf,
	getInteractionOptionValue,
	getUserIdFromMentionOrUsername,
	readFool
} from "../helpers";

import type { ICommand } from "../types";
export const foolCommand: ICommand = {
	prefix: /.*!fool .*/gim,
	command: "!fool",
	description:
		"Run by the current mayor to make another user the fool. Usage: `!fool [username/@user]`",
	handler: async (msg: Message) => {
		const embed = await fool(msg.member, () => getFirstMentionOrSelf(msg));
		await msg.channel.send({ embeds: [embed] });
	},
	slash: {
		name: "fool",
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
			const user = getInteractionOptionValue<string>("user", int);
			const embed = await fool(int.member as GuildMember, () =>
				user ? getUserIdFromMentionOrUsername(user, int.guild) : int.user.id
			);
			await int.reply({ embeds: [embed] });
		}
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
