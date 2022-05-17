import type { Message } from "discord.js";

import type { ICommand, IUser } from "../types";
import { Api, Embed, getFirstMentionOrSelf } from "../helpers";

export const payBucksCommand: ICommand = {
	prefix: /.*!pay .* [0-9]{1,}/gmi,
	command: "!pay",
	description: "Pay BillyBucks directly to another user! Usage: `!pay [username/@user] [amount]`",
	handler: async (msg: Message) => {
		const amount = msg.content.substring(msg.content.lastIndexOf(" ")).trim();
		if (typeof parseInt(amount) !== "number") throw "amount must be a number";
		const recipientId = getFirstMentionOrSelf(msg);
		if (recipientId === msg.author.id) throw `You cannot pay yourself, ${msg.author.username}!`;
		const data = await Api.post("bucks/pay", {
			server_id: msg.guild.id,
			amount: parseInt(amount),
			recipient_id: recipientId,
			sender_id: msg.author.id
		});
		const recipient = data[recipientId] as IUser;
		const embed = Embed.success(msg, `You paid ${recipient.username} ${amount} BillyBuck(s)!`, recipient.username);
		msg.channel.send(embed);
		return;
	}
};