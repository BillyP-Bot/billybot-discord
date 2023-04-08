import type { ChatInputCommandInteraction, GuildMember, Message } from "discord.js";

import type { IUser } from "btbot-types";
import type { ICommand } from "../types";
import { Api, assertMayor, Embed } from "../helpers";

export const taxesCommand: ICommand = {
	prefix: /.*!taxes.*/gim,
	command: "!taxes",
	description:
		"The current mayor collects taxes from all middle and upper-class citizens. Resets every Friday.",
	handler: async (msg: Message) => {
		const embed = await taxes(msg.member);
		await msg.channel.send({ embeds: [embed] });
	},
	slash: {
		name: "taxes",
		description: "The current mayor collects taxes from all middle and upper-class citizens",
		handler: async (int: ChatInputCommandInteraction) => {
			const embed = await taxes(int.member as GuildMember);
			await int.reply({ embeds: [embed] });
		}
	}
};

const taxes = async (member: GuildMember) => {
	await assertMayor(member);
	const data = await Api.post<{
		payout: number;
		tax_rate: number;
		charged_users: number;
		user: IUser;
	}>("bucks/taxes", {
		server_id: member.guild.id,
		user_id: member.user.id
	});
	let text = `${data.tax_rate} BillyBucks have been collected from ${data.charged_users} citizens!\n`;
	text += `Collection Payout: +${data.payout}\n`;
	text += `Mayor <@${member.user.id}> now has ${data.user.billy_bucks} BillyBucks!`;
	return Embed.success(text, "Tax Time!");
};
