import type { ChatInputCommandInteraction } from "discord.js";

import type { IUser } from "btbot-types";
import type { ISlashCommand } from "../types";
import { Api, Embed } from "../helpers";
import { CommandNames } from "../types/enums";

export const buyTicketCommand: ISlashCommand = {
	name: CommandNames.ticket,
	description: "Buy a ticket for a chance to win this week's lottery",
	handler: async (int: ChatInputCommandInteraction) => {
		await int.deferReply();
		const embed = await ticket(int.user.id, int.guild.id);
		await int.editReply({ embeds: [embed] });
	}
};

const ticket = async (user_id: string, server_id: string) => {
	const data = await Api.post<{ ticket_cost: number }>("lottery", {
		server_id,
		user_id
	});
	const user = data[user_id] as IUser;
	let body = `You bought a lottery ticket for ${data.ticket_cost} BillyBucks!\n\n`;
	body += `You now have ${user.billy_bucks} BillyBucks, a winner will be picked on Friday at noon!`;
	return Embed.success(body, "Lottery Ticket Purchased");
};
