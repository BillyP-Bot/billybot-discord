import type { ChatInputCommandInteraction, Message } from "discord.js";

import { Api, Embed, formatDateMMDD } from "../helpers";

import type { IUser } from "btbot-types";
import type { ICommand } from "../types";

export const birthdaysCommand: ICommand = {
	prefix: /.*!birthdays.*/gim,
	command: "!birthdays",
	description: "Show all birthdays that have been set",
	handler: async (msg: Message) => {
		const embed = await getBirthdays(msg.guild.id);
		msg.channel.send({ embeds: [embed] });
	},
	slash: {
		name: "birthdays",
		description: "Show all birthdays that have been set",
		handler: async (int: ChatInputCommandInteraction) => {
			const embed = await getBirthdays(int.guild.id);
			int.reply({ embeds: [embed] });
		}
	}
};

const getBirthdays = async (server_id: string) => {
	const users = await Api.get<IUser[]>(`users/birthday/server/${server_id}`);
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
		return user.birthday ? acc + `${user.username}: ${formatDateMMDD(user.birthday)}\n` : acc;
	}, "");
	return Embed.success(output ?? "No birthdays registered!", "Upcoming Birthdays");
};
