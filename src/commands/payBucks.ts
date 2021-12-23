import { Message, MessageEmbed } from "discord.js";

import { BtBackend } from "../services/rest";
import { ErrorMessage } from "../helpers/message";
import { ICommandHandler } from "../types";

export default {
	case: "billypay",
	requiredArgs: true,
	arguments: ["username", "amount"],
	properUsage: "!billypay [username] [amount]",
	resolver: async (msg: Message, args: string[]) => {
		try {
	
			const buckEmbed = new MessageEmbed();
			const [recipient, amount] = args;

			if (recipient == msg.author.username) throw new Error("you cannot pay yourself!");
	
			const exists = msg.guild.members.cache.find(a => a.user.username.toUpperCase() === recipient.toUpperCase().trim());
			if (!exists) throw new Error(`Could not find ${recipient} in this server.`);
	
			try {
				const { data } = await BtBackend.Client.put("user/pay", {
					server: msg.guild.id,
					amount: +amount,
					payerId: msg.author.id,
					recipientId: exists.id
				});
				if (!data.payment) throw new Error();
			
				const results = data.payment[msg.author.username].billy_bucks;
				const results2 = data.payment[recipient].billy_bucks;
			
				buckEmbed.setColor("GREEN");
				buckEmbed.setDescription(`You paid ${recipient} \`${amount}\` BillyBucks!\n${recipient}: ${results2}\n${msg.author.username}: ${results}`);
				await msg.channel.send({ embeds: [buckEmbed] });
			} catch (error) {
				ErrorMessage(msg, error);
			}
		} catch (error) {
			ErrorMessage(msg, error);
		}
	}
} as ICommandHandler;