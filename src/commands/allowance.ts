import type { ChatInputCommandInteraction } from "discord.js";

import type { IUser } from "btbot-types";
import type { ISlashCommand } from "../types";
import { Api, Embed } from "../helpers";
import { CommandNames } from "../types/enums";

export const allowanceCommand: ISlashCommand = {
	name: CommandNames.allowance,
	description: "Collect your weekly BillyBuck allowance (only available once a week)",
	handler: async (int: ChatInputCommandInteraction) => {
		await int.deferReply();
		const embed = await allowance(int.user.id, int.guild.id);
		await int.editReply({ embeds: [embed] });
	}
};

const allowance = async (user_id: string, server_id: string) => {
	const data = await Api.post("bucks/allowance", {
		server_id,
		user_id
	});
	const user = data[user_id] as IUser;
	return Embed.success(
		`Here's your allowance, <@${user_id}>! You now have ${user.billy_bucks} BillyBucks!`,
		"+200"
	);
};
