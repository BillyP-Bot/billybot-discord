import type { Message } from "discord.js";

import type { ICommand } from "../types";
import { Api, Embed, getServerDisplayName } from "../helpers";
import { IParticipant } from "btbot-types";

export const closeBetCommand: ICommand = {
	prefix: /.*!closebet .*/gim,
	command: "!closebet",
	description: "Close Betting on current mayoral challenge. Usage: `!closebet`",
	handler: async (msg: Message) => {
		const server_id = msg.guild.id;
		const result = await Api.put<{
			server_id: string;
			is_betting_active: boolean;
			participants: IParticipant[];
		}>("/challenges/close", { server_id, author_id: msg.author.id });
		const usernames = result.participants.map(({ user_id }) => {
			const { name } = getServerDisplayName(msg, user_id);
			return name;
		});
		const embed = Embed.success(
			`Closed betting on current challenge between ${usernames[0]} on ${usernames[1]}`
		);
		msg.channel.send(embed);
		return;
	}
};
