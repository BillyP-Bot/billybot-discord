import type { ChatInputCommandInteraction, Guild, GuildMember } from "discord.js";
import { ApplicationCommandOptionType } from "discord.js";

import {
	Api,
	assertMayor,
	buildCongratsMessage,
	Embed,
	getInteractionOptionValue,
	readFool
} from "../helpers";
import { CommandNames } from "../types/enums";

import type { IUser } from "btbot-types";

import type { ISlashCommand } from "../types";

export const concedeCommand: ISlashCommand = {
	name: CommandNames.concede,
	description: "The current mayor makes another user the mayor",
	options: [
		{
			name: "user",
			description: "The user to make mayor (can be called on self)",
			type: ApplicationCommandOptionType.User,
			required: true
		}
	],
	handler: async (int: ChatInputCommandInteraction) => {
		await int.deferReply();
		const targetUserId = getInteractionOptionValue<string>("user", int);
		const embed = await concede(targetUserId, int.member as GuildMember, int.guild);
		await int.editReply({ embeds: [embed] });
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
