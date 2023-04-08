import { ChatInputCommandInteraction, Message } from "discord.js";

import { Api, Embed } from "../helpers";

import type { IUser } from "btbot-types";
import type { ICommand } from "../types";
export const noblemenCommand: ICommand = {
	prefix: /.*!noblemen.*/gim,
	command: "!noblemen",
	description: "Get the 3 richest users in the server",
	handler: async (msg: Message) => {
		const embed = await noblemen(msg.guild.id);
		await msg.channel.send({ embeds: [embed] });
	},
	slash: {
		name: "noblemen",
		description: "Get the 3 richest users in the server",
		handler: async (int: ChatInputCommandInteraction) => {
			const embed = await noblemen(int.guild.id);
			await int.reply({ embeds: [embed] });
		}
	}
};

const noblemen = async (server_id: string) => {
	const users = await Api.get<IUser[]>(`bucks/noblemen/${server_id}`);
	const description = users.reduce((acc, { user_id, billy_bucks }, i) => {
		return (acc += `**${i + 1}.** <@${user_id}> ${billy_bucks} BillyBucks\n\n`);
	}, "");
	return Embed.success(description, "Noblemen");
};
