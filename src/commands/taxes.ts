import type { Message } from "discord.js";

import type { IUser } from "btbot-types";
import type { ICommand } from "../types";
import { Api, assertMayor, Embed, getServerDisplayName } from "../helpers";

export const taxesCommand: ICommand = {
	prefix: /.*!taxes.*/gim,
	command: "!taxes",
	description:
		"The Current mayor collects taxes from all middle and upper-class citizens! Resets every Friday.",
	handler: async (msg: Message) => {
		await assertMayor(msg);
		const server_id = msg.guild.id;
		const body = {
			server_id,
			user_id: msg.author.id
		};
		const data = await Api.post<{
			payout: number;
			tax_rate: number;
			charged_users: number;
			user: IUser;
		}>("bucks/taxes", body);
		const { name } = getServerDisplayName(msg, msg.author.id);
		let text = `${data.tax_rate} BillyBucks have been collected from ${data.charged_users} citizens!\n`;
		text += `Collection Payout: +${data.payout}\n`;
		text += `Mayor ${name} now has ${data.user.billy_bucks} BillyBucks!`;
		const embed = Embed.success(text, "Tax Time!");
		msg.channel.send({ embeds: [embed] });
		return;
	}
};
