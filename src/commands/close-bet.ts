import type { Message } from "discord.js";

import type { ICommand, BetAggregate } from "../types";
import { Api, Embed, getServerDisplayName, buildCurrentBetsMessage } from "../helpers";
import { IParticipant } from "btbot-types";

export const closeBetCommand: ICommand = {
	prefix: /.*!closebet .*/gim,
	command: "!closebet",
	description: "Close Betting on current mayoral challenge. Usage: `!closebet`",
	handler: async (msg: Message) => {
		const server_id = msg.guild.id;
		const result = await Api.put<{
			server_id: string;
			participants: IParticipant[];
			bets_aggregate: BetAggregate;
		}>("/challenges/close", { server_id, author_id: msg.author.id });
		const usernames = result.participants.map(({ user_id }) => {
			const { name } = getServerDisplayName(msg, user_id);
			return name;
		});
		const betsMessage = buildCurrentBetsMessage(msg, result.bets_aggregate);
		const embed = Embed.success(
			`Closed betting on current challenge between ${usernames[0]} and ${usernames[1]}\n\n${betsMessage}`
		);
		msg.channel.send({ embeds: [embed] });
		return;
	}
};
