import { Message, MessageEmbed } from "discord.js";

import { BtBackend } from "../services/rest";
import { ICommandHandler } from "../types";
import { ErrorMessage } from "../helpers/message";

export default {
	case: "allowance",
	requiredArgs: false,
	arguments: [],
	properUsage: "!allowance",
	resolver: async (msg: Message) => {
		try {
			const embed = new MessageEmbed();
			embed.setColor("GREEN");

			const { allowance } = await (await BtBackend.Client.put("user/allowance", undefined, {
				params: {
					serverId: msg.guild.id,
					userId: msg.author.id
				}
			})).data;

			const { billy_bucks, last_allowance } = allowance;
			const next = new Date(new Date(last_allowance).getDate() + 7).toLocaleDateString(undefined, {
				year: "numeric", month: "long", day: "numeric"
			});

			embed.setTitle("+ 200");
			embed.setDescription(`
				Here's your allowance, ${msg.author.username}! You now have ${billy_bucks} BillyBucks!\n
				Next allowance available ${next}
			`);

			await msg.channel.send({ embeds: [embed] });
		} catch (error) {
			ErrorMessage(msg, error);
		}
	}
} as ICommandHandler;