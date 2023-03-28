import type { Message } from "discord.js";

import type { IUser } from "btbot-types";
import type { ICommand } from "../types";
import { Api, Embed, getServerDisplayName } from "../helpers";

export const allowanceCommand: ICommand = {
	prefix: /.*!allowance.*/gim,
	command: "!allowance",
	description: "Collect your weekly BillyBuck allowance! Only available once a week.",
	handler: async (msg: Message) => {
		const data = await Api.post("bucks/allowance", {
			server_id: msg.guild.id,
			user_id: msg.author.id
		});
		const { name } = getServerDisplayName(msg);
		const user = data[msg.author.id] as IUser;
		const embed = Embed.success(
			`Here's your allowance, ${name}! You now have ${user.billy_bucks} BillyBucks!`,
			"+ 200"
		);
		msg.channel.send({ embeds: [embed] });
		return;
	}
};
