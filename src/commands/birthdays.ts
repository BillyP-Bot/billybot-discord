import type { ChatInputCommandInteraction } from "discord.js";

import { Api, Embed, formatDateMMDD } from "../helpers";
import { CommandNames } from "../types/enums";

import type { IUser } from "btbot-types";
import type { ISlashCommand } from "../types";

export const birthdaysCommand: ISlashCommand = {
	name: CommandNames.birthdays,
	description: "Show all birthdays that have been set",
	handler: async (int: ChatInputCommandInteraction) => {
		await int.deferReply();
		const embed = await birthdays(int.guild.id);
		await int.editReply({ embeds: [embed] });
	}
};

const birthdays = async (server_id: string) => {
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
