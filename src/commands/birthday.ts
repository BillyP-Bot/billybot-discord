import { IUser } from "btbot-types";
import { ApplicationCommandOptionType, ChatInputCommandInteraction } from "discord.js";

import { CommandNames } from "@enums";
import { Api, Embed, formatDateMMDD, getInteractionOptionValue } from "@helpers";
import { ISlashCommand } from "@types";

export const birthdayCommand: ISlashCommand = {
	name: CommandNames.birthday,
	description: "Set your own birthday if it has not already been set",
	options: [
		{
			name: "date",
			description: "Your birthday in MM-DD format",
			type: ApplicationCommandOptionType.String,
			min_length: 5,
			max_length: 5,
			required: true
		}
	],
	handler: async (int: ChatInputCommandInteraction) => {
		await int.deferReply();
		const birthdayDate = getInteractionOptionValue<string>("date", int);
		const user = await Api.get<IUser>(`users?user_id=${int.user.id}&server_id=${int.guild.id}`);
		if (user.birthday) {
			throw `Your birthday is already set to ${formatDateMMDD(
				user.birthday
			)}. Cannot set again!`;
		}

		const embed = await birthday(user, birthdayDate);
		await int.editReply({ embeds: [embed] });
	}
};

const birthday = async (user: IUser, birthdayToValidate: string) => {
	const birthday = birthdayToValidate.replace(/\[|\]/g, "");
	const birthdaySplit = birthday.split("-");
	const [month, day] = birthdaySplit;
	if (birthdaySplit.length !== 2 || month.length !== 2 || day.length !== 2)
		throw "Invalid format! Must use `MM-DD` date format.";
	if (!isValidDate(month, day))
		throw `Invalid date! \`${birthday}\` is in the required \`MM-DD\` format, but is not a valid calendar date!`;

	const [updated] = (await Api.put<IUser>("users", [
		{
			server_id: user.server_id,
			user_id: user.user_id,
			birthday
		}
	])) as unknown as IUser[];

	return Embed.success(
		`You successfully set your birthday to ${formatDateMMDD(updated.birthday)}!`,
		"Birthday Set"
	);
};

const isValidDate = (month: string, day: string) => {
	return isValidMonth(month) && isValidDay(month, day);
};

const isValidMonth = (month: string) => {
	const monthNum = +month;
	return monthNum >= 1 && monthNum <= 12;
};

const isValidDay = (month: string, day: string) => {
	const dayNum = +day;
	return (
		dayNum >= 1 &&
		dayNum <= 31 &&
		(dayNum <= 29 || (dayNum <= 30 && ["04", "06", "09", "11"].includes(month)))
	);
};
