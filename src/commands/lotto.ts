import type { Message } from "discord.js";

import type { ICommand, IUser } from "../types";
import { Api, Embed } from "../helpers";

export const lottoCommand: ICommand = {
	prefix: /.*!lotto.*/gmi,
	command: "!lotto",
	description: "View the current jackpot and list of entrants in this week's lottery!",
	handler: async (msg: Message) => {
		const data = await Api.get<{
			ticket_cost: number,
			jackpot: number,
			entrants: IUser[],
			base_lottery_jackpot: number,
			entrants_count: number
		}>(`lottery/server/${msg.guild.id}`);
		if (data.entrants.length <= 0) {
			const embed = Embed.success(msg, "No entrants yet!", "Weekly Lottery");
			msg.channel.send(embed);
			return;
		}
		let body = `A winner will be picked on Friday at noon! Buy a ticket today for ${data.ticket_cost} BillyBucks!\n\n`;
		body += `Ticket Cost: ${data.ticket_cost}\n`;
		body += `Base Lottery Jackpot: ${data.base_lottery_jackpot}\n`;
		body += `Current Jackpot: ${data.jackpot}\n`;
		body += `Entrants: ${data.entrants_count}\n\n`;
		data.entrants.map(({ username }) => body += username + "\n");
		const embed = Embed.success(msg, body, "Weekly Lottery");
		msg.channel.send(embed);
		return;
	}
};