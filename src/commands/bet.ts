import type { Message } from "discord.js";

import type { ICommand } from "../types";
import { Api, Embed, getFirstMentionOrSelf, getServerDisplayName } from "../helpers";

export const betCommand: ICommand = {
	prefix: /.*!bet .*/gim,
	command: "!bet",
	description:
		"Bet on a particpant of the current mayoral challenge! Usage: `!bet [username/@user] [amount]`",
	handler: async (msg: Message) => {
		const args = msg.content.slice("!bet".length).trim().split(" ");
		const amount = parseInt(args[1]);
		const participant_id = getFirstMentionOrSelf(msg, "!bet".length);
		const server_id = msg.guild.id;
		const body = {
			server_id,
			user_id: msg.author.id,
			participant_id,
			amount
		};
		await Api.post("/challenges/bet", body);
		const { name } = getServerDisplayName(msg, participant_id);
		const embed = Embed.success(`Bet ${amount} on ${name}`);
		msg.channel.send(embed);
		return;
	}
};
