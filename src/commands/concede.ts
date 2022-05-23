import type { Message } from "discord.js";

import type { ICommand } from "../types";
import { Api, assertMayor, readFool, Embed, getFirstMentionOrSelf } from "../helpers";

export const concedeCommand: ICommand = {
	prefix: /.*!concede .*/gim,
	command: "!concede",
	description:
		"The Current mayor makes another user the mayor! Usage: `!concede [username/@user]`",
	handler: async (msg: Message) => {
		const mayorRole = await assertMayor(msg);
		const { foolRole, currentFool } = await readFool(msg);
		const author = await msg.guild.members.fetch(msg.author.id);
		const targetUserId = getFirstMentionOrSelf(msg);
		if (targetUserId === author.user.id) throw "you are already the mayor!";
		const server_id = msg.guild.id;
		const body = [
			{
				server_id,
				user_id: targetUserId,
				is_mayor: true
			},
			{
				server_id,
				user_id: author.user.id,
				is_mayor: false,
				is_fool: true
			},
			{
				server_id,
				user_id: currentFool.user.id,
				is_fool: false
			}
		];
		await Api.put("users", body);
		const mention = await msg.guild.members.fetch(targetUserId);
		mention.roles.add(mayorRole);
		author.roles.remove(mayorRole);
		author.roles.add(foolRole);
		currentFool.roles.remove(foolRole);
		const embed = Embed.success(
			msg,
			`<@${targetUserId}> is now the mayor!\n@<${author.id}> is the new fool!`,
			"Mayoral Decree!"
		);
		msg.channel.send(embed);
		return;
	}
};
