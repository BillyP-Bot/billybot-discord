import type { ChatInputCommandInteraction, Message } from "discord.js";
import { ApplicationCommandOptionType } from "discord.js";

import {
	Api,
	Embed,
	getInteractionOptionValue,
	getServerDisplayName,
	getUserIdFromMentionOrUsername
} from "../helpers";

import type { IUser } from "btbot-types";
import type { ICommand } from "../types";
export const bucksCommand: ICommand = {
	prefix: /.*!bucks.*/gim,
	command: "!bucks",
	description: "Get your current balance of BillyBucks (optional `!bucks [username/@user]`) ",
	handler: async (msg: Message) => {
		const { id } = getServerDisplayName(msg);
		const { billy_bucks } = await Api.get<IUser>(
			`users?user_id=${id}&server_id=${msg.guild.id}`
		);
		const embed = Embed.success(`<@${id}> has ${billy_bucks} BillyBucks!`);
		await msg.channel.send({ embeds: [embed] });
	},
	slash: {
		name: "bucks",
		description: "View your or another user's current balance of BillyBucks",
		options: [
			{
				name: "user",
				description: "The @mention or username of the user (runs on self if omitted)",
				type: ApplicationCommandOptionType.String
			}
		],
		handler: async (int: ChatInputCommandInteraction) => {
			const user = getInteractionOptionValue<string>("user", int);
			const userId = user ? getUserIdFromMentionOrUsername(user, int.guild) : int.user.id;
			const { billy_bucks } = await Api.get<IUser>(
				`users?user_id=${userId}&server_id=${int.guild.id}`
			);
			const embed = Embed.success(`<@${userId}> has ${billy_bucks} BillyBucks!`);
			await int.reply({ embeds: [embed] });
		}
	}
};
