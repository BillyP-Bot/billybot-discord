import type { Message } from "discord.js";

import type { ICommand } from "../types";
import {
	Api,
	assertMayor,
	readFool,
	Embed,
	getFirstMentionOrSelf,
	buildCongratsMessage
} from "../helpers";

export const concedeCommand: ICommand = {
	prefix: /.*!concede .*/gim,
	command: "!concede",
	description:
		"The Current mayor makes another user the mayor! Usage: `!concede [username/@user]`",
	handler: async (msg: Message) => {
		const mayorRole = await assertMayor(msg);
		const { foolRole, currentFool } = await readFool(msg);
		const targetUserId = getFirstMentionOrSelf(msg);
		const { new_mayor_id, new_fool_id, results } = await Api.put("challenges/resolve", {
			server_id: msg.guild.id,
			participant_id: targetUserId
		});
		const newMayor = await msg.guild.members.fetch(new_mayor_id);
		const newFool = await msg.guild.members.fetch(new_fool_id);
		newMayor.roles.add(mayorRole);
		newFool.roles.remove(mayorRole);
		newFool.roles.add(foolRole);
		currentFool?.roles.remove(foolRole);
		const embed = Embed.success(
			`<@${newMayor.user.id}> is now the mayor!\n<@${newFool.user.id}> is the new fool!\n\n` +
				buildCongratsMessage(msg, results),
			"Mayoral Decree!"
		);
		msg.channel.send(embed);
		return;
	}
};
