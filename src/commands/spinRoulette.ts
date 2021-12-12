import { Message, MessageEmbed } from "discord.js";

import { BtBackend } from "../services/rest";
import { ICommandHandler } from "../types";

export default {
	case: "spin",
	requiredArgs: true,
	arguments: ["number", "color"],
	properUsage: "!spin [number] [color]",
	resolver: async (msg: Message, args: string[]) => {
		let [bet, color] = args;
		const amount = parseInt(bet);
		color = color.toUpperCase().trim();
		if(isNaN(amount) || color !== ("RED" || "GREEN" || "BLACK")) throw new Error("invalid format");
		try {
			const buckEmbed = new MessageEmbed();
			const { data } = await BtBackend.Client.post("user/roulette", { userId: msg.author.id, serverId: msg.guild.id, color, amount });
			const { gameResult } = data;
			if(gameResult.won) {
				buckEmbed.setColor("GREEN");
				buckEmbed.setTitle("You Won!");
				buckEmbed.setDescription(`It's ${gameResult.colorResult}! You win ${gameResult.earnings} BillyBucks! Lady LUUUCCCCKKK!\n\nYou now have ${gameResult.billy_bucks} BillyBucks.`);
				msg.channel.send({ embeds: [buckEmbed] });
				return;
			}
			buckEmbed.setColor("RED");
			buckEmbed.setTitle("You Lost!");
			buckEmbed.setDescription(`It's ${gameResult.colorResult}! You lose your bet of ${amount} BillyBucks! You're a DEAD MAAANNN!\n\nYou now have ${gameResult.billy_bucks} BillyBucks.`);
			msg.channel.send({ embeds: [buckEmbed] });
		} catch (error) {
			throw new Error(error.response.data.error);
		}
	}
} as ICommandHandler;