import { IBet } from "btbot-types";
import { ApplicationCommandOptionType } from "discord.js";

import {
	Api,
	Embed,
	getFirstMentionOrSelf,
	getInteractionOptionValue,
	getServerDisplayName,
	getUserIdFromMentionOrUsername
} from "../helpers";

import type { ChatInputCommandInteraction, Message } from "discord.js";

import type { ICommand } from "../types";
export const betCommand: ICommand = {
	prefix: /.*!bet .*/gim,
	command: "!bet",
	description:
		"Bet on a particpant of the current mayoral challenge. Usage: `!bet [username/@user] [amount]`",
	handler: async (msg: Message) => {
		const args = msg.content.slice("!bet".length).trim().split(" ");
		const amount = parseInt(args[1]);
		const participant_id = getFirstMentionOrSelf(msg, "!bet".length);
		const server_id = msg.guild.id;
		const body = {
			server_id,
			user_id: msg.author.id,
			participant_id,
			amount
		};
		const result = await Api.post<{ bet: IBet & { billy_bucks: number } }>(
			"/challenges/bet",
			body
		);
		const { name } = getServerDisplayName(msg, participant_id);
		const embed = Embed.success(
			`Bet ${amount} on ${name}\n\nYou now have ${result.billy_bucks} BillyBucks`
		);
		msg.channel.send({ embeds: [embed] });
		return;
	},
	slash: {
		name: "bet",
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
	}
};
