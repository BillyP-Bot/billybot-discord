import type { ChatInputCommandInteraction } from "discord.js";
import { ApplicationCommandOptionType } from "discord.js";

import { Api, Embed, getInteractionOptionValue, getUserIdFromMentionOrUsername } from "../helpers";
import { CommandNames } from "../types/enums";

import type { IUser } from "btbot-types";

import type { ISlashCommand } from "../types";

export const bucksCommand: ISlashCommand = {
	name: CommandNames.bucks,
	description: "View your or another user's current balance of BillyBucks",
	options: [
		{
			name: "user",
			description: "The @mention or username of the user (runs on self if omitted)",
			type: ApplicationCommandOptionType.String
		}
	],
	handler: async (int: ChatInputCommandInteraction) => {
		await int.deferReply();
		const user = getInteractionOptionValue<string>("user", int);
		const userId = user ? getUserIdFromMentionOrUsername(user, int.guild) : int.user.id;
		const { billy_bucks } = await Api.get<IUser>(
			`users?user_id=${userId}&server_id=${int.guild.id}`
		);
		const embed = Embed.success(`<@${userId}> has ${billy_bucks} BillyBucks!`);
		await int.editReply({ embeds: [embed] });
	}
};
