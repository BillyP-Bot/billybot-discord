import type { Message } from "discord.js";

import type { IUser, ICommand } from "../types";
import { Api, Embed } from "../helpers";

export const allowanceCommand: ICommand = {
	prefix: /.*!allowance.*/gmi,
	command: "!allowance",
	description: "Collect your weekly BillyBuck allowance! Only available once a week.",
	handler: async (msg: Message) => {
		const data = await Api.post("bucks/allowance", {
			server_id: msg.guild.id,
			user_id: msg.author.id
		});
		const user = data[msg.author.id] as IUser;
		const embed = Embed.success(msg, `Here's your allowance, ${user.username}! You now have ${user.billy_bucks} BillyBucks!`, "+ 200");
		msg.channel.send(embed);
		return;
	}
};