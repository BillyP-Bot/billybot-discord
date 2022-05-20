import type { Message } from "discord.js";

import type { BlackJackGameResponse, ICommand } from "../types";
import { Api, buildBlackjackResponse } from "../helpers";

export const blackjackHitCommand: ICommand = {
	prefix: /.*!hit.*/gim,
	command: "!hit",
	description: "Hit in your current game of Blackjack",
	handler: async (msg: Message) => {
		const data = await Api.post<BlackJackGameResponse>("gamble/blackjack/hit", {
			server_id: msg.guild.id,
			user_id: msg.author.id,
			double_down: false
		});
		const response = buildBlackjackResponse(data, msg.author.id);
		msg.channel.send(response);
		return;
	}
};
