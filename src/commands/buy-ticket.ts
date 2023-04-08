import type { ChatInputCommandInteraction, Message } from "discord.js";

import type { IUser } from "btbot-types";
import type { ICommand } from "../types";
import { Api, Embed } from "../helpers";

export const buyTicketCommand: ICommand = {
	prefix: /.*!ticket.*/gim,
	command: "!ticket",
	description: "Buy a ticket for a chance to win this week's lottery",
	handler: async (msg: Message) => {
		const embed = await ticket(msg.author.id, msg.guild.id);
		await msg.channel.send({ embeds: [embed] });
	},
	slash: {
		name: "ticket",
		description: "Buy a ticket for a chance to win this week's lottery",
		handler: async (int: ChatInputCommandInteraction) => {
			const embed = await ticket(int.user.id, int.guild.id);
			await int.reply({ embeds: [embed] });
		}
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
