import type { IParticipant } from "btbot-types";
import type { ChatInputCommandInteraction } from "discord.js";

import { CommandNames } from "@enums";
import { Api, Embed, buildCurrentBetsMessage } from "@helpers";
import type { BetAggregate, ISlashCommand } from "@types";

export const closeBetCommand: ISlashCommand = {
	name: CommandNames.closebet,
	description: "Close betting on the current mayoral challenge",
	handler: async (int: ChatInputCommandInteraction) => {
		await int.deferReply();
		const embed = await closeBet(int.guild.id, int.user.id);
		await int.editReply({ embeds: [embed] });
	}
};

const closeBet = async (server_id: string, author_id: string) => {
	const { participants, bets_aggregate } = await Api.put<{
		participants: IParticipant[];
		bets_aggregate: BetAggregate;
	}>("/challenges/close", { server_id, author_id });
	const betsMessage = buildCurrentBetsMessage(bets_aggregate);
	return Embed.success(
		`Closed betting on the current challenge between <@${participants[0].user_id}> and <@${participants[1].user_id}>\n\n${betsMessage}`
	);
};
