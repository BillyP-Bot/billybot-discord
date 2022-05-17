import type { Message } from "discord.js";

import type { BlackJackGameResponse, ICommand } from "../types";
import { Api, buildBlackjackResponse } from "../helpers";

export const blackjackStandCommand: ICommand = {
	prefix: /.*!stand.*/gmi,
	command: "!stand",
	description: "Stand in your current game of Blackjack",
	handler: async (msg: Message) => {
		const data = await Api.post<BlackJackGameResponse>("gamble/blackjack/stand", {
			server_id: msg.guild.id,
			user_id: msg.author.id
		});
		const response = buildBlackjackResponse(data, msg.author.id);
		msg.channel.send(response);
		return;
	}
};