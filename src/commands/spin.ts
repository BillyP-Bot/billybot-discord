import type { Message } from "discord.js";

import type { IUser } from "btbot-types";
import type { ICommand } from "../types";
import { Api, Embed } from "../helpers";

export const spinCommand: ICommand = {
	prefix: /.*!spin.*/gim,
	command: "!spin",
	description: "Let's play Roulette! Usage: `!spin [betAmount] [red/black/green]`",
	handler: async (msg: Message) => {
		const args = msg.content.slice("!spin".length).trim().split(" ");
		const bet = parseInt(args[0]);
		const color = args[1];
		const data = await Api.post<{
			user: IUser;
			outcome: {
				won: boolean;
				payout: number;
				winning_color: string;
			};
		}>("gamble/roulette/spin", {
			server_id: msg.guild.id,
			user_id: msg.author.id,
			color,
			amount: bet
		});
		const { user, outcome } = data;
		if (!outcome.won) {
			const embed = Embed.error(
				msg,
				`It's ${outcome.winning_color}! You lose your bet of ${bet} BillyBucks! You're a DEAD MAAANNN!\n You now have ${user.billy_bucks} BillyBucks.`,
				"You Lost!"
			);
			return msg.channel.send(embed);
		}
		const embed = Embed.success(
			msg,
			`It's ${outcome.winning_color}! You win ${outcome.payout} BillyBucks! Lady LUUUCCCCKKK!\n You now have ${user.billy_bucks} BillyBucks.`,
			"You Won!"
		);
		return msg.channel.send(embed);
	}
};
