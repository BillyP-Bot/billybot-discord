import type { ChatInputCommandInteraction, MessageReaction } from "discord.js";

import { Colors, CommandNames } from "@enums";
import { Api, Embed, buildBlackjackResponse, mentionChannel } from "@helpers";
import type { BlackJackGameResponse, ISlashCommand } from "@types";

export const blackjackStandCommand: ISlashCommand = {
	name: CommandNames.stand,
	description: "Stand in your current blackjack hand",
	handler: async (int: ChatInputCommandInteraction) => {
		await int.deferReply();
		const embed = await stand(int.guild.id, int.user.id);
		await int.editReply({ embeds: [embed] });
	},
	reactHandler: async (react: MessageReaction, sender_id: string) => {
		const embed = await stand(react.message.guild.id, sender_id);
		if (!react.message.channel.isSendable())
			throw `${mentionChannel(react.message.channel.id)} is not sendable!`;
		await react.message.channel.send({ embeds: [embed] });
	}
};

const stand = async (server_id: string, user_id: string) => {
	const data = await Api.post<BlackJackGameResponse>("gamble/blackjack/stand", {
		server_id,
		user_id
	});
	const response = buildBlackjackResponse(data, user_id);
	const color = !data.won && data.is_complete ? Colors.red : Colors.green;
	return Embed.success(response, null, color);
};
