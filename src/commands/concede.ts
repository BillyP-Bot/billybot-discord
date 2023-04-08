import type { ChatInputCommandInteraction, Guild, GuildMember, Message } from "discord.js";
import { ApplicationCommandOptionType } from "discord.js";

import {
	Api,
	assertMayor,
	buildCongratsMessage,
	Embed,
	getFirstMentionOrSelf,
	getInteractionOptionValue,
	getUserIdFromMentionOrUsername,
	readFool
} from "../helpers";

import type { IUser } from "btbot-types";

import type { ICommand } from "../types";
export const concedeCommand: ICommand = {
	prefix: /.*!concede .*/gim,
	command: "!concede",
	description:
		"The current mayor makes another user the mayor. Usage: `!concede [username/@user]`",
	handler: async (msg: Message) => {
		const targetUserId = getFirstMentionOrSelf(msg);
		const embed = await concede(targetUserId, msg.member, msg.guild);
		await msg.channel.send({ embeds: [embed] });
	},
	slash: {
		name: "concede",
		description: "The current mayor makes another user the mayor",
		options: [
			{
				name: "user",
				description: "The @mention or username of the user to make mayor",
				type: ApplicationCommandOptionType.String,
				required: true
			}
		],
		handler: async (int: ChatInputCommandInteraction) => {
			const user = getInteractionOptionValue<string>("user", int);
			const targetUserId = getUserIdFromMentionOrUsername(user, int.guild);
			const embed = await concede(targetUserId, int.member as GuildMember, int.guild);
			await int.reply({ embeds: [embed] });
		}
	}
};

const concede = async (targetUserId: string, member: GuildMember, guild: Guild) => {
	const mayorRole = await assertMayor(member);
	const { foolRole, currentFool } = await readFool(guild);
	const { new_mayor_id, new_fool_id, results } = await Api.put<{
		new_mayor_id: string;
		new_fool_id: string;
		results: IUser[];
	}>("challenges/resolve", {
		server_id: guild.id,
		participant_id: targetUserId
	});
	const [newMayor, newFool] = await Promise.all([
		guild.members.fetch(new_mayor_id),
		guild.members.fetch(new_fool_id)
	]);
	await Promise.all([
		newMayor.roles.add(mayorRole),
		newFool.roles.remove(mayorRole),
		newFool.roles.add(foolRole),
		currentFool?.roles.remove(foolRole)
	]);
	return Embed.success(
		`<@${newMayor.user.id}> is now the mayor!\n<@${newFool.user.id}> is the new fool!\n\n` +
			buildCongratsMessage(results),
		"Mayoral Decree!"
	);
};
