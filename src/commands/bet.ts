import { IBet } from "btbot-types";
import { ApplicationCommandOptionType } from "discord.js";

import { Api, Embed, getInteractionOptionValue, getUserIdFromMentionOrUsername } from "../helpers";
import { CommandNames } from "../types/enums";

import type { ChatInputCommandInteraction } from "discord.js";
import type { ISlashCommand } from "../types";
export const betCommand: ISlashCommand = {
	name: CommandNames.bet,
	description: "Bet on a participant of the current mayoral challenge",
	options: [
		{
			name: "participant",
			description: "The @mention or username of the challenge participant to bet on",
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
		await int.deferReply();
		const participant = getInteractionOptionValue<string>("participant", int);
		const amount = getInteractionOptionValue<number>("amount", int);
		const participantId = getUserIdFromMentionOrUsername(participant, int.guild);
		const embed = await bet(int.guild.id, int.user.id, participantId, amount);
		await int.editReply({ embeds: [embed] });
	}
};

const bet = async (server_id: string, user_id: string, participant_id: string, amount: number) => {
	const { billy_bucks } = await Api.post<{ bet: IBet & { billy_bucks: number } }>(
		"/challenges/bet",
		{
			server_id,
			user_id,
			participant_id,
			amount
		}
	);
	return Embed.success(
		`Bet ${amount} on <@${participant_id}>\n\nYou now have ${billy_bucks} BillyBucks`
	);
};
