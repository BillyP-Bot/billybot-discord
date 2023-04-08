import { IBet } from "btbot-types";
import { ApplicationCommandOptionType } from "discord.js";

import { Api, Embed, getInteractionOptionValue, getUserIdFromMentionOrUsername } from "../helpers";
import { CommandNames } from "../types/enums";

import type { ChatInputCommandInteraction } from "discord.js";
import type { ISlashCommand } from "../types";
export const betCommand: ISlashCommand = {
	name: CommandNames.bet,
	description: "Bet on a particpant of the current mayoral challenge",
	options: [
		{
			name: "participant",
			description: "The challenge participant (@mention/username) to place the bet on",
			type: ApplicationCommandOptionType.String,
			required: true
		},
		{
			name: "amount",
			description: "The number of BillyBucks to bet",
			type: ApplicationCommandOptionType.Integer,
			required: true,
			minValue: 1
		}
	],
	handler: async (int: ChatInputCommandInteraction) => {
		const participant = getInteractionOptionValue<string>("participant", int);
		const amount = getInteractionOptionValue<string>("amount", int);
		const participantId = getUserIdFromMentionOrUsername(participant, int.guild);
		const res = await Api.post<{ bet: IBet & { billy_bucks: number } }>("/challenges/bet", {
			server_id: int.guild.id,
			user_id: int.user.id,
			participant_id: participantId,
			amount: amount
		});
		const embed = Embed.success(
			`Bet ${amount} on <@${participantId}>\n\nYou now have ${res.billy_bucks} BillyBucks`
		);
		await int.reply({ embeds: [embed] });
	}
};
