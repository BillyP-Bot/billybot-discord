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
		const embed = await ticket(int.guild.id, int.user.id);
		await int.editReply({ embeds: [embed] });
	}
};

const ticket = async (server_id: string, user_id: string) => {
	const data = await Api.post<{ ticket_cost: number }>("lottery", {
		server_id,
		user_id
	});
	const { billy_bucks } = data[user_id] as IUser;
	let body = `You bought a lottery ticket for ${data.ticket_cost} BillyBucks!\n\n`;
	body += `You now have ${billy_bucks} BillyBucks. A winner will be picked on Friday at noon!`;
	return Embed.success(body, "Lottery Ticket Purchased");
};
