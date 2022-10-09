import { Message } from "discord.js";

import {
	Api,
	Embed,
	formatDateMMDD,
	getFirstMentionOrSelf,
	getServerDisplayName
} from "../helpers";

import type { IUser } from "btbot-types";
import type { ICommand } from "../types";
export const birthdayCommand: ICommand = {
	prefix: /.*!birthday.*/gim,
	command: "!birthday",
	description:
		"View your own or another user's birthday, or set your own birthday if it has not been set yet. " +
		"Usage: `!birthday` or `!birthday [username/@user]` to view, or `!birthday [MM-DD]` to set.",
	handler: async (msg: Message) => {
		const args = msg.content.slice("!birthday".length).trim().split(" ");
		let mentions = msg.mentions.members.array().length;

		let targetUserId;
		try {
			targetUserId = getFirstMentionOrSelf(msg);
			mentions++;
		} catch (error) {
			targetUserId = msg.author.id;
		}

		const { name } = getServerDisplayName(msg, targetUserId);
		const onSelf = targetUserId === msg.author.id;

		const user = await Api.get<IUser>(
			`users?user_id=${targetUserId}&server_id=${msg.guild.id}`
		);

		const date = user.birthday ? formatDateMMDD(user.birthday) : "not set";

		if (onSelf && args[0] && mentions === 0) {
			if (user.birthday) throw `Your birthday is already set to ${date}. Cannot set again!`;
			await setOwnBirthday(msg, user, name, args[0]);
			return;
		}

		let output = `${onSelf ? "Your" : `<@${user.user_id}>'s`} birthday is ${date}!`;
		if (onSelf && !user.birthday)
			output +=
				"\n\nRun `!birthday [MM-DD]` to set your birthday.\n\n" +
				"(**WARNING**: You can only set your birthday once!)";
		const embed = Embed.success(output, name);
		msg.channel.send(embed);
		return;
	}
};

const setOwnBirthday = async (
	msg: Message,
	user: IUser,
	name: string,
	birthdayToValidate: string
) => {
	const birthday = birthdayToValidate.replace(/\[|\]/g, "");
	const birthdaySplit = birthday.split("-");
	const [month, day] = birthdaySplit;
	if (birthdaySplit.length !== 2 || month.length !== 2 || day.length !== 2)
		throw "Invalid format! Must use `MM-DD` date format.\n\nExample: `!birthday 03-31` for March 31st.";
	if (!isValidDate(month, day))
		throw `Invalid date! \`${birthday}\` is in the required \`MM-DD\` format, but is not a valid calendar date!`;

	const [updated] = (await Api.put<IUser>("users", [
		{
			server_id: user.server_id,
			user_id: user.user_id,
			birthday
		}
	])) as unknown as IUser[];

	const embed = Embed.success(
		`You successfully set your birthday to ${formatDateMMDD(updated.birthday)}!`,
		name
	);
	await msg.channel.send(embed);
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
