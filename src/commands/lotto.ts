import { Message, MessageEmbed } from "discord.js";

import { BtBackend } from "../services/rest";
import { ICommandHandler } from "../types";

export default {
	case: "lotto",
	requiredArgs: false,
	arguments: [],
	properUsage: "!lotto",
	resolver: async (msg: Message) => {
		try {
			const embed = new MessageEmbed();

			const { lotteryInfo } = await (await BtBackend.Client.get("user/lottery", {
				params: { serverId: msg.guild.id }
			})).data;

			const { count, jackpot, ticket_cost } = lotteryInfo;

			embed.setColor("GREEN");
			embed.setTitle("Weekly Lottery");
			embed.setDescription(`
				A winner will be picked on Friday at noon! Buy a ticket today for ${ticket_cost} BillyBucks!\n
				Jackpot: ${jackpot}
				Entrants: ${count}
			`);

			await msg.channel.send({ embeds: [embed] });
		} catch (error) {
			throw new Error(error.response.data.error);
		}
	}
} as ICommandHandler;