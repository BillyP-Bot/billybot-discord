import type { Message } from "discord.js";

import type { ICommand } from "../types";
import { Api, assertMayor, Embed, getFirstMentionOrSelf } from "../helpers";

export const concedeCommand: ICommand = {
	prefix: /.*!concede .*/gim,
	command: "!concede",
	description:
		"The Current mayor makes another user the mayor! Usage: `!concede [username/@user]`",
	handler: async (msg: Message) => {
		const mayorRole = await assertMayor(msg);
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
				is_mayor: false
			}
		];
		await Api.put("users", body);
		const mention = await msg.guild.members.fetch(targetUserId);
		mention.roles.add(mayorRole);
		author.roles.remove(mayorRole);
		const embed = Embed.success(msg, `<@${targetUserId}> is now the mayor!`, "Mayoral Decree!");
		msg.channel.send(embed);
		return;
	}
};
