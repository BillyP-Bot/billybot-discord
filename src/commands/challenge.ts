import type { IChallenge } from "btbot-types";
import {
	ApplicationCommandOptionType,
	type ChatInputCommandInteraction,
	type Guild
} from "discord.js";

import { CommandNames } from "@enums";
import {
	Api,
	Embed,
	getInteractionOptionValue,
	mentionCommand,
	postCurrentChallenge,
	readMayor
} from "@helpers";
import type { ISlashCommand } from "@types";

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
		await int.deferReply();
		const details = getInteractionOptionValue<string>("details", int);

		const { reply, embed } = await challenge(details, int.user.id, int.guild);
		if (reply) {
			await int.editReply(reply);
			await int.channel.send({ embeds: [embed] });
		} else {
			await int.editReply({ embeds: [embed] });
		}
	}
};

const challenge = async (details: string, user_id: string, guild: Guild) => {
	if (!details) {
		const embed = await postCurrentChallenge(guild.id);
		return { reply: null, embed };
	}
	const { currentMayor } = await readMayor(guild);
	if (currentMayor.user.id === user_id) throw "mayor cannot challenge themselves";
	await Api.post<IChallenge>("challenges", {
		server_id: guild.id,
		user_id,
		details
	});
	const reply = `<@${currentMayor.id}>, <@${user_id}> has challenged you!`;
	const embed = Embed.success(
		`<@${user_id}> has challenged mayor <@${currentMayor.id}>!\n\n` +
			`Use ${mentionCommand(CommandNames.bet)} to bet on a winner.\n\n` +
			`>>> ${details}`,
		"A Challenger Approaches!"
	);
	return { reply, embed };
};
