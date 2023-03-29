import type { Message } from "discord.js";

import type { ICommand } from "../types";
import { IChallenge } from "btbot-types";

import { Api, Embed, getServerDisplayName, postCurrentChallenge, readMayor } from "../helpers";

export const challengeCommand: ICommand = {
	prefix: /.*!challenge .*/gim,
	command: "!challenge",
	description:
		"Challenge for the current Mayor for the highest seat in the land! Usage: `!challenge [details]`",
	handler: async (msg: Message) => {
		const server_id = msg.guild.id;
		const details = msg.content.slice("!challenge".length).trim();
		if (!details) {
			const embed = await postCurrentChallenge(msg);
			msg.channel.send({ embeds: [embed] });
			return;
		}
		const author = getServerDisplayName(msg, msg.author.id);
		const { currentMayor } = await readMayor(msg);
		if (currentMayor.user.id === author.id) throw "mayor cannot challenge themselves";
		const body = {
			server_id,
			user_id: author.id,
			details
		};
		await Api.post<IChallenge>("challenges", body);
		const reply = `<@${currentMayor.id}>, <@${author.id}> has challenged you!`;
		const embed = Embed.success(
			`${author.name} has challenged mayor ${currentMayor.displayName}!\n\n` +
				`Use the "!bet <@${author.id}>" or "!bet <@${currentMayor.user.id}>" to bet on a winner.\n\n` +
				`>>> ${details}`,
			"Challenger Approaches!"
		);
		msg.channel.send(reply);
		msg.channel.send({ embeds: [embed] });
		return;
	}
};
