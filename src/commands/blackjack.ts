import type { ChatInputCommandInteraction, Message } from "discord.js";
import { ApplicationCommandOptionType } from "discord.js";

import { Api, buildBlackjackResponse, getInteractionOptionValue } from "../helpers";

import type { BlackJackGameResponse, ICommand } from "../types";
export const blackjackCommand: ICommand = {
	prefix: /.*!blackjack [0-9].*/gim,
	command: "!blackjack",
	description: "Let's play blackjack! Usage: `!blackjack [betAmount]`",
	handler: async (msg: Message) => {
		const wager = msg.content.substring(msg.content.lastIndexOf(" ")).trim();
		if (typeof parseInt(wager) !== "number") throw "amount must be a number";
		const data = await Api.post<BlackJackGameResponse>("gamble/blackjack", {
			server_id: msg.guild.id,
			user_id: msg.author.id,
			wager: parseInt(wager)
		});
		const response = buildBlackjackResponse(data, msg.author.id);
		const message = await msg.channel.send(response);
		if (!data.is_complete)
			await Promise.all([message.react("🟩"), message.react("🟨"), message.react("🟦")]);
	},
	slash: {
		name: "blackjack",
		description: "Let's play blackjack",
		options: [
			{
				name: "bet",
				description: "The number of BillyBucks to bet",
				type: ApplicationCommandOptionType.Integer,
				required: true,
				minValue: 10
			}
		],
		handler: async (int: ChatInputCommandInteraction) => {
			const bet = getInteractionOptionValue<number>("bet", int);
			const data = await Api.post<BlackJackGameResponse>("gamble/blackjack", {
				server_id: int.guild.id,
				user_id: int.user.id,
				wager: bet
			});
			const response = buildBlackjackResponse(data, int.user.id);
			const replyInt = await int.reply(response);
			if (!data.is_complete) {
				const replyMsg = await replyInt.fetch();
				await Promise.all([
					replyMsg.react("🟩"),
					replyMsg.react("🟨"),
					replyMsg.react("🟦")
				]);
			}
		}
	}
};
