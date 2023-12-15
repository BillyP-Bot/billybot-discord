import { IUser } from "btbot-types";
import { ChatInputCommandInteraction } from "discord.js";

import { CommandNames } from "@enums";
import { Api, Embed } from "@helpers";
import { ISlashCommand } from "@types";

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
	const drawTime = new Date(Date.UTC(0, 0, 0, 16));
	const timeString = drawTime.toLocaleTimeString("en-US", {
		timeZone: "EST",
		hour: "2-digit",
		minute: "2-digit"
	});
	let body = `You bought a lottery ticket for ${data.ticket_cost} BillyBucks!\n\n`;
	body += `You now have ${billy_bucks} BillyBucks. A winner will be picked on Friday at ${timeString} EST!`;
	return Embed.success(body, "Lottery Ticket Purchased");
};
