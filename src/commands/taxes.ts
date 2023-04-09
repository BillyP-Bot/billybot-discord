import type { ChatInputCommandInteraction, GuildMember } from "discord.js";

import type { IUser } from "btbot-types";
import type { ISlashCommand } from "../types";
import { Api, assertMayor, Embed } from "../helpers";
import { CommandNames } from "../types/enums";

export const taxesCommand: ISlashCommand = {
	name: CommandNames.taxes,
	description: "The current mayor collects taxes from all middle and upper-class citizens",
	handler: async (int: ChatInputCommandInteraction) => {
		await int.deferReply();
		const embed = await taxes(int.member as GuildMember);
		await int.editReply({ embeds: [embed] });
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
