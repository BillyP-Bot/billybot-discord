import type { ChatInputCommandInteraction } from "discord.js";

import type { IUser } from "btbot-types";
import type { ISlashCommand } from "../types";
import { Api, Embed } from "../helpers";
import { CommandNames } from "../types/enums";

export const lottoCommand: ISlashCommand = {
	name: CommandNames.lotto,
	description: "View the current jackpot and list of entrants in this week's lottery",
	handler: async (int: ChatInputCommandInteraction) => {
		const embed = await lotto(int.guild.id);
		await int.reply({ embeds: [embed] });
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
	let body = `A winner will be picked on Friday at noon! Buy a ticket today for ${ticket_cost} BillyBucks!\n\n`;
	body += `Ticket Cost: ${ticket_cost}\n`;
	body += `Base Lottery Jackpot: ${base_lottery_jackpot}\n`;
	body += `Current Jackpot: ${jackpot}\n`;
	body += `Entrants: ${entrants.length}\n\n`;
	entrants.forEach(({ user_id }) => (body += `<@${user_id}>\n`));
	return Embed.success(body, "Weekly Lottery");
};
