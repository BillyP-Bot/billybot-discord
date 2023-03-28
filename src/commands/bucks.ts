import type { Message } from "discord.js";

import type { IUser } from "btbot-types";
import type { ICommand } from "../types";
import { Api, Embed, getServerDisplayName } from "../helpers";

export const bucksCommand: ICommand = {
	prefix: /.*!bucks.*/gim,
	command: "!bucks",
	description: "Get your current balance of BillyBucks, (Optional `!bucks [username/@user]`) ",
	handler: async (msg: Message) => {
		const { name, id } = getServerDisplayName(msg);
		const data = await Api.get<IUser>(`users?user_id=${id}&server_id=${msg.guild.id}`);
		const user = data;
		const embed = Embed.success(`${name} has ${user.billy_bucks} BillyBucks!`);
		msg.channel.send({ embeds: [embed] });
		return;
	}
};
