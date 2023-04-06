import { ApplicationCommandOptionType, ChatInputCommandInteraction, Message } from "discord.js";

import {
	Api,
	Embed,
	getInteractionOptionValue,
	getServerDisplayName,
	getUserIdFromAtMention,
	getUserIdFromUsername,
	isAtMention
} from "../helpers";

import type { IUser } from "btbot-types";
import type { ICommand } from "../types";
export const bucksCommand: ICommand = {
	prefix: /.*!bucks.*/gim,
	command: "!bucks",
	description: "Get your current balance of BillyBucks, (Optional `!bucks [username/@user]`) ",
	handler: async (msg: Message) => {
		const { id } = getServerDisplayName(msg);
		const { billy_bucks } = await getUser(id, msg.guild.id);
		const embed = Embed.success(`<@${id}> has ${billy_bucks} BillyBucks!`);
		msg.channel.send({ embeds: [embed] });
		return;
	},
	slash: {
		name: "bucks",
		description: "Get your or another user's current balance of BillyBucks",
		options: [
			{
				name: "user",
				description: "The @mention or username of the user (runs on self if omitted)",
				type: ApplicationCommandOptionType.String
			}
		],
		handler: async (int: ChatInputCommandInteraction) => {
			let userId = int.user.id;
			const userOptionValue = getInteractionOptionValue<string>("user", int);
			if (userOptionValue) {
				if (isAtMention(userOptionValue)) {
					userId = getUserIdFromAtMention(userOptionValue);
				} else {
					userId = getUserIdFromUsername(userOptionValue, int.guild);
				}
			}
			const { billy_bucks } = await getUser(userId, int.guild.id);
			const embed = Embed.success(`<@${userId}> has ${billy_bucks} BillyBucks!`);
			int.reply({ embeds: [embed] });
		}
	}
};

const getUser = async (user_id: string, server_id: string) =>
	Api.get<IUser>(`users?user_id=${user_id}&server_id=${server_id}`);
