import type { Message } from "discord.js";

import type { ICommand } from "../types";
import { Api, assertMayor, readFool, Embed, getFirstMentionOrSelf } from "../helpers";

export const foolCommand: ICommand = {
	prefix: /.*!fool .*/gim,
	command: "!fool",
	description: "The Current mayor makes another user the fool! Usage: `!fool [username/@user]`",
	handler: async (msg: Message) => {
		await assertMayor(msg);
		const { foolRole, currentFool } = await readFool(msg);
		const targetUserId = getFirstMentionOrSelf(msg);
		if (targetUserId === currentFool.user.id) throw `<@${targetUserId}> is already the fool!`;
		const server_id = msg.guild.id;
		const body = [
			{
				server_id,
				user_id: targetUserId,
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
		mention.roles.add(foolRole);
		currentFool.roles.remove(foolRole);
		const embed = Embed.success(msg, `<@${targetUserId}> is now the fool!`, "Mayoral Decree!");
		msg.channel.send(embed);
		return;
	}
};
