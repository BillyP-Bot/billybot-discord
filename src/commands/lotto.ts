import type { ChatInputCommandInteraction } from "discord.js";

import type { IUser } from "btbot-types";
import type { ISlashCommand } from "../types";
import { Api, Embed, mentionCommand } from "../helpers";
import { CommandNames } from "../types/enums";

export const lottoCommand: ISlashCommand = {
	name: CommandNames.lotto,
	description: "View the current jackpot and list of entrants in this week's lottery",
	handler: async (int: ChatInputCommandInteraction) => {
		await int.deferReply();
		const embed = await lotto(int.guild.id);
		await int.editReply({ embeds: [embed] });
	}
};

const lotto = async (server_id: string) => {
	const { entrants, ticket_cost, base_lottery_jackpot, jackpot } = await Api.get<{
		ticket_cost: number;
		jackpot: number;
		entrants: IUser[];
		base_lottery_jackpot: number;
	}>(`lottery/server/${server_id}`);
	if (entrants.length <= 0) {
		return Embed.success("No entrants yet!", "Weekly Lottery");
	}
	const ticketCommandMention = mentionCommand(CommandNames.ticket);
	let body = `A winner will be picked on Friday at noon! Run ${ticketCommandMention} to buy a ticket today for ${ticket_cost} BillyBucks!\n\n`;
	body += `Ticket Cost: ${ticket_cost}\n`;
	body += `Base Lottery Jackpot: ${base_lottery_jackpot}\n`;
	body += `Current Jackpot: ${jackpot}\n`;
	body += `Entrants: ${entrants.length}\n\n`;
	entrants.forEach(({ user_id }) => (body += `<@${user_id}>\n`));
	return Embed.success(body, "Weekly Lottery");
};
