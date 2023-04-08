import type { ChatInputCommandInteraction, Message } from "discord.js";

import type { IUser } from "btbot-types";
import type { ICommand } from "../types";
import { Api, Embed } from "../helpers";

export const allowanceCommand: ICommand = {
	prefix: /.*!allowance.*/gim,
	command: "!allowance",
	description: "Collect your weekly BillyBuck allowance (only available once a week)",
	handler: async (msg: Message) => {
		const embed = await allowance(msg.author.id, msg.guild.id);
		await msg.channel.send({ embeds: [embed] });
	},
	slash: {
		name: "allowance",
		description: "Collect your weekly BillyBuck allowance (only available once a week)",
		handler: async (int: ChatInputCommandInteraction) => {
			const embed = await allowance(int.user.id, int.guild.id);
			await int.reply({ embeds: [embed] });
		}
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
		"+ 200"
	);
};
