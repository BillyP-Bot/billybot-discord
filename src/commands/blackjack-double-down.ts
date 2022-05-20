import type { Message } from "discord.js";

import type { BlackJackGameResponse, ICommand } from "../types";
import { Api, buildBlackjackResponse } from "../helpers";

export const blackjackDoubleDownCommand: ICommand = {
	prefix: /.*!doubledown.*/gim,
	command: "!doubledown",
	description: "Double down and hit in BLackjack, must be turn 1!",
	handler: async (msg: Message) => {
		const data = await Api.post<BlackJackGameResponse>("gamble/blackjack/hit", {
			server_id: msg.guild.id,
			user_id: msg.author.id,
			double_down: true
		});
		const response = buildBlackjackResponse(data, msg.author.id);
		msg.channel.send(response);
		return;
	}
};
