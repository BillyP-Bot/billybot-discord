import { IUser } from "btbot-types";
import { ApplicationCommandOptionType, ChatInputCommandInteraction } from "discord.js";

import { CommandNames } from "@enums";
import { Api, Embed, getInteractionOptionValue } from "@helpers";
import { ISlashCommand } from "@types";

export const spinCommand: ISlashCommand = {
	name: CommandNames.spin,
	description: "Play a spin of Roulette",
	options: [
		{
			name: "bet",
			description: "The number of BillyBucks to bet",
			type: ApplicationCommandOptionType.Integer,
			required: true,
			min_value: 1
		},
		{
			name: "color",
			description: "🟥 or ⬛: 18/38 chance, 1:1 payout. 🟩: 2/38 chance, 17:1 payout.",
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
		await int.deferReply();
		const bet = getInteractionOptionValue<number>("bet", int);
		const color = getInteractionOptionValue<string>("color", int);
		const embed = await spin(bet, color, int.user.id, int.guild.id);
		await int.editReply({ embeds: [embed] });
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
