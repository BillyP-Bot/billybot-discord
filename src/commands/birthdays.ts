import { IUser } from "btbot-types";
import { ChatInputCommandInteraction, Guild } from "discord.js";

import { CommandNames } from "@enums";
import { Api, Embed, formatDateMMDD, mentionCommand } from "@helpers";
import { ISlashCommand } from "@types";

export const birthdaysCommand: ISlashCommand = {
	name: CommandNames.birthdays,
	description: "Show all birthdays that have been set",
	handler: async (int: ChatInputCommandInteraction) => {
		await int.deferReply();
		const embed = await birthdays(int.guild);
		await int.editReply({ embeds: [embed] });
	}
};

const birthdays = async (guild: Guild) => {
	const [users, guildMemberLookup] = await Promise.all([
		Api.get<IUser[]>(`users/birthday/server/${guild.id}`),
		guild.members.fetch()
	]);
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
	const output =
		sortedUsers.reduce((acc, user) => {
			return user.birthday
				? acc +
						`${guildMemberLookup.get(user.user_id).displayName}: ${formatDateMMDD(
							user.birthday
						)}\n`
				: acc;
		}, "") || "No birthdays registered!\n";
	const fullOutput =
		output + `\nRun ${mentionCommand(CommandNames.birthday)} to set your own birthday!`;
	return Embed.success(fullOutput, "Upcoming Birthdays");
};
