import { Message, MessageEmbed } from "discord.js";

import { BtBackend } from "../services/rest";
import { ICommandHandler } from "../types";

export default {
	case: "buylottoticket",
	requiredArgs: false,
	arguments: [],
	properUsage: "!buylottoticket",
	resolver: async (msg: Message) => {
		try {
			const embed = new MessageEmbed();

			const { ticketInfo } = await (await BtBackend.Client.post("user/lottery", {
				serverId: msg.guild.id,
				userId: msg.author.id
			})).data;

			const { billy_bucks, ticket_cost } = ticketInfo;

			embed.setColor("GREEN");
			embed.setTitle("Lottery Ticket Purchased!");
			embed.setDescription(`
				You bought a lottery ticket for ${ticket_cost} BillyBucks!\n
				You now have ${billy_bucks}\n
				A winner will be picked on Friday at noon!`
			);
			await msg.channel.send({ embeds: [embed] });
		} catch (error) {
			throw new Error(error.response.data.error);
		}
	}
} as ICommandHandler;