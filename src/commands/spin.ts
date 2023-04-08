import { ApplicationCommandOptionType } from "discord.js";

import { Api, Embed, getInteractionOptionValue } from "../helpers";

import type { ChatInputCommandInteraction, Message } from "discord.js";

import type { IUser } from "btbot-types";
import type { ICommand } from "../types";
export const spinCommand: ICommand = {
	prefix: /.*!spin.*/gim,
	command: "!spin",
	description: "Play a spin of Roulette. Usage: `!spin [betAmount] [red/black/green]`",
	handler: async (msg: Message) => {
		const args = msg.content.slice("!spin".length).trim().split(" ");
		const bet = parseInt(args[0]);
		const color = args[1];
		const embed = await spin(bet, color, msg.author.id, msg.guild.id);
		await msg.channel.send({ embeds: [embed] });
	},
	slash: {
		name: "spin",
		description: "Play a spin of Roulette",
		options: [
			{
				name: "bet",
				description: "The number of BillyBucks to bet",
				type: ApplicationCommandOptionType.Integer,
				required: true,
				minValue: 1
			},
			{
				name: "color",
				description: "The color to bet on",
				type: ApplicationCommandOptionType.String,
				required: true,
				choices: [
					{
						name: "🟥",
						value: "red"
					},
					{
						name: "⬛",
						value: "black"
					},
					{
						name: "🟩",
						value: "green"
					}
				]
			}
		],
		handler: async (int: ChatInputCommandInteraction) => {
			const bet = getInteractionOptionValue<number>("bet", int);
			const color = getInteractionOptionValue<string>("color", int);
			const embed = await spin(bet, color, int.user.id, int.guild.id);
			await int.reply({ embeds: [embed] });
		}
	}
};

const spin = async (bet: number, color: string, user_id: string, server_id: string) => {
	const data = await Api.post<{
		user: IUser;
		outcome: {
			won: boolean;
			payout: number;
			winning_color: string;
		};
	}>("gamble/roulette/spin", {
		server_id: server_id,
		user_id: user_id,
		color,
		amount: bet
	});
	const { user, outcome } = data;
	if (!outcome.won) {
		return Embed.error(
			`It's ${outcome.winning_color}! You lose your bet of ${bet} BillyBucks! You're a DEAD MAAANNN!\n You now have ${user.billy_bucks} BillyBucks.`,
			"You Lost!"
		);
	}
	return Embed.success(
		`It's ${outcome.winning_color}! You win ${outcome.payout} BillyBucks! Lady LUUUCCCCKKK!\n You now have ${user.billy_bucks} BillyBucks.`,
		"You Won!"
	);
};
