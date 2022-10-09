import { Message } from "discord.js";

import { Api, Embed, formatDateMMDD } from "../helpers";

import type { IUser } from "btbot-types";
import type { ICommand } from "../types";

export const birthdaysCommand: ICommand = {
	prefix: /.*!birthdays.*/gim,
	command: "!birthdays",
	description: "Show every user's birthday!",
	handler: async (msg: Message) => {
		const users = await Api.get<IUser[]>(`users/birthday/server/${msg.guild.id}`);
		const output = users.reduce((acc, user) => {
			return user.birthday
				? acc + `<@${user.user_id}>: ${formatDateMMDD(user.birthday)}\n`
				: acc;
		}, "");
		const embed = Embed.success(output, "All Birthdays");
		msg.channel.send(embed);
		return;
	}
};
