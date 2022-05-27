import type { Message } from "discord.js";

import type { IUser } from "btbot-types";
import type { ICommand } from "../types";
import { Api, Embed } from "../helpers";

export const buyTicketCommand: ICommand = {
	prefix: /.*!ticket.*/gim,
	command: "!ticket",
	description: "Buy a ticket for a chance to win this week's lottery!",
	handler: async (msg: Message) => {
		const data = await Api.post<{ ticket_cost: number }>("lottery", {
			server_id: msg.guild.id,
			user_id: msg.author.id
		});
		const user = data[msg.author.id] as IUser;
		let body = `You bought a lottery ticket for ${data.ticket_cost} BillyBucks!\n\n`;
		body += `You now have ${user.billy_bucks} BillyBucks, a winner will be picked on Friday at noon!`;
		const embed = Embed.success(body, "Lottery Ticket Purchased");
		msg.channel.send(embed);
		return;
	}
};
