import type { Message } from "discord.js";

import type { ICommand, IUser } from "../types";
import { Api, Embed, getFirstMentionOrSelf } from "../helpers";

export const bucksCommand: ICommand = {
	prefix: /.*!bucks.*/gmi,
	command: "!bucks",
	description: "Get your current balance of BillyBucks, (Optional `!bucks [username/@user]`) ",
	handler: async (msg: Message) => {
		const id = getFirstMentionOrSelf(msg);
		const data = await Api.get<IUser>(`users?user_id=${id}&server_id=${msg.guild.id}`);
		const user = data;
		const embed = Embed.success(msg, `${user.username} has ${user.billy_bucks} BillyBucks!`, user.username);
		msg.channel.send(embed);
		return;
	}
};