import type { Message } from "discord.js";

import type { ICommand, IUser } from "../types";
import { Api, assertMayor, Embed } from "../helpers";

export const taxesCommand: ICommand = {
	prefix: /.*!taxes.*/gmi,
	command: "!taxes",
	description: "The Current mayor collects taxes from all middle and upper-class citizens! Resets every Friday.",
	handler: async (msg: Message) => {
		await assertMayor(msg);
		const server_id = msg.guild.id;
		const body = {
			server_id,
			user_id: msg.author.id
		};
		const data = await Api.post<{
			payout: number,
			tax_rate: number,
			charged_users: number,
			user: IUser
		}>("bucks/taxes", body);
		let text = `${data.tax_rate} BillyBucks have been collected from ${data.charged_users} citizens!\n`;
		text += `Collection Payout: +${data.payout}\n`;
		text += `Mayor ${data.user.username} now has ${data.user.billy_bucks} BillyBucks!`;
		const embed = Embed.success(msg, text, "Tax Time!");
		msg.channel.send(embed);
		return;
	}
};