import type { ChatInputCommandInteraction, Guild } from "discord.js";
import { IChallenge } from "btbot-types";
import { ApplicationCommandOptionType } from "discord.js";

import {
	Api,
	Embed,
	getCommandMention,
	getInteractionOptionValue,
	postCurrentChallenge,
	readMayor
} from "../helpers";
import { CommandNames } from "../types/enums";

import type { ISlashCommand } from "../types";
export const challengeCommand: ISlashCommand = {
	name: CommandNames.challenge,
	description: "Challenge the current mayor for the highest seat in the land",
	options: [
		{
			name: "details",
			description: "The details of the challenge",
			type: ApplicationCommandOptionType.String
		}
	],
	handler: async (int: ChatInputCommandInteraction) => {
		const details = getInteractionOptionValue<string>("details", int);
		if (!details) {
			const embed = await postCurrentChallenge(int.guild.id);
			await int.reply({ embeds: [embed] });
			return;
		}
		const { reply, embed } = await challenge(details, int.user.id, int.guild);
		await int.reply(reply);
		await int.channel.send({ embeds: [embed] });
	}
};

const challenge = async (details: string, user_id: string, guild: Guild) => {
	const { currentMayor } = await readMayor(guild);
	if (currentMayor.user.id === user_id) throw "mayor cannot challenge themselves";
	const [betCommandMention] = await Promise.all([
		getCommandMention("bet", guild),
		Api.post<IChallenge>("challenges", {
			server_id: guild.id,
			user_id,
			details
		})
	]);
	const reply = `<@${currentMayor.id}>, <@${user_id}> has challenged you!`;
	const embed = Embed.success(
		`<@${user_id}> has challenged mayor <@${currentMayor.id}>!\n\n` +
			`Use ${betCommandMention} to bet on a winner.\n\n` +
			`>>> ${details}`,
		"A Challenger Approaches!"
	);
	return { reply, embed };
};
