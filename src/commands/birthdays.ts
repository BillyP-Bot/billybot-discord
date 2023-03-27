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

		const today = new Date();
		today.setHours(0, 0, 0, 0);
		const todayTime = today.getTime();

		const { nextBdayIndex } = users.reduce(
			(acc, { birthday }, i) => {
				const birthdayDate = new Date(birthday);
				birthdayDate.setFullYear(today.getFullYear());
				const birthdayTime = birthdayDate.getTime();
				const diff = birthdayTime - todayTime;
				if (diff >= 0 && diff < acc.diff) {
					acc.diff = diff;
					acc.nextBdayIndex = i;
				}
				return acc;
			},
			{ diff: Number.MAX_VALUE, nextBdayIndex: 0 }
		);

		const sortedUsers = users.slice(nextBdayIndex).concat(users.slice(0, nextBdayIndex));

		const output = sortedUsers.reduce((acc, user) => {
			return user.birthday
				? acc + `${user.username}: ${formatDateMMDD(user.birthday)}\n`
				: acc;
		}, "");

		const embed = Embed.success(output ?? "No Birthdays Registered", "Upcoming Birthdays");
		msg.channel.send({ embeds: [embed] });
		return;
	}
};
