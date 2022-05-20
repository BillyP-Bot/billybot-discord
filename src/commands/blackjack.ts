import type { Message } from "discord.js";

import type { BlackJackGameResponse, ICommand } from "../types";
import { Api, buildBlackjackResponse } from "../helpers";

export const blackjackCommand: ICommand = {
	prefix: /.*!blackjack [0-9].*/gim,
	command: "!blackjack",
	description: "Let's play Blackjack! Usage: `!blackjack [betAmount]`",
	handler: async (msg: Message) => {
		const wager = msg.content.substring(msg.content.lastIndexOf(" ")).trim();
		if (typeof parseInt(wager) !== "number") throw "amount must be a number";
		const data = await Api.post<BlackJackGameResponse>("gamble/blackjack", {
			server_id: msg.guild.id,
			user_id: msg.author.id,
			wager: parseInt(wager)
		});
		const response = buildBlackjackResponse(data, msg.author.id);
		msg.channel.send(response);
		return;
	}
};
