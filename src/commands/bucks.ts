import type { IUser } from "btbot-types";
import { ApplicationCommandOptionType, type ChatInputCommandInteraction } from "discord.js";

import { CommandNames } from "@enums";
import { Api, Embed, getInteractionOptionValue } from "@helpers";
import type { ISlashCommand } from "@types";

export const bucksCommand: ISlashCommand = {
	name: CommandNames.bucks,
	description: "View your or another user's current balance of BillyBucks",
	options: [
		{
			name: "user",
			description:
				"The user whose BillyBucks balance you want to view (runs on self if omitted)",
			type: ApplicationCommandOptionType.User
		}
	],
	handler: async (int: ChatInputCommandInteraction) => {
		await int.deferReply();
		const userId = getInteractionOptionValue<string>("user", int, int.user.id);
		const onSelf = userId === int.user.id;
		const embed = await bucks(int.guild.id, userId, onSelf);
		await int.editReply({ embeds: [embed] });
	}
};

const bucks = async (server_id: string, user_id: string, onSelf?: boolean) => {
	const { billy_bucks } = await Api.get<IUser>(`users?user_id=${user_id}&server_id=${server_id}`);
	return Embed.success(`${onSelf ? "You have" : `<@${user_id}> has`} ${billy_bucks} BillyBucks!`);
};
