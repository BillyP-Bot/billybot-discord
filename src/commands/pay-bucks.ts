import type { ChatInputCommandInteraction, Message } from "discord.js";
import { ApplicationCommandOptionType } from "discord.js";

import {
	Api,
	Embed,
	getInteractionOptionValue,
	getServerDisplayName,
	getUserIdFromMentionOrUsername
} from "../helpers";

import type { IUser } from "btbot-types";
import type { ICommand } from "../types";
export const payBucksCommand: ICommand = {
	prefix: /.*!pay .* [0-9]{1,}/gim,
	command: "!pay",
	description: "Pay BillyBucks directly to another user. Usage: `!pay [username/@user] [amount]`",
	handler: async (msg: Message) => {
		const amount = msg.content.substring(msg.content.lastIndexOf(" ")).trim();
		if (typeof parseInt(amount) !== "number") throw "amount must be a number";
		const { id: recipientId } = getServerDisplayName(msg);
		const embed = await payBucks(msg.guild.id, msg.author.id, recipientId, parseInt(amount));
		await msg.channel.send({ embeds: [embed] });
	},
	slash: {
		name: "pay",
		description: "Pay BillyBucks directly to another user",
		options: [
			{
				name: "user",
				description: "The @mention or username of the user to pay BillyBucks to",
				type: ApplicationCommandOptionType.String,
				required: true
			},
			{
				name: "amount",
				description: "The amount of BillyBucks to pay the other user",
				type: ApplicationCommandOptionType.Integer,
				required: true,
				minValue: 1
			}
		],
		handler: async (int: ChatInputCommandInteraction) => {
			const user = getInteractionOptionValue<string>("user", int);
			const recipient_id = getUserIdFromMentionOrUsername(user, int.guild);
			const amount = getInteractionOptionValue<number>("amount", int);
			const embed = await payBucks(int.guild.id, int.user.id, recipient_id, amount);
			await int.reply({ embeds: [embed] });
		}
	}
};

const payBucks = async (
	server_id: string,
	sender_id: string,
	recipient_id: string,
	amount: number
) => {
	if (sender_id === recipient_id) throw "You cannot pay yourself!";
	if (amount < 1) throw "Amount must be a positive integer!";
	const data = await Api.post("bucks/pay", {
		server_id,
		amount,
		recipient_id,
		sender_id
	});
	const { billy_bucks } = data[sender_id] as IUser;
	return Embed.success(
		`You paid <@${recipient_id}> ${amount} BillyBucks!\nYou now have ${billy_bucks} BillyBucks.`,
		"Payment Successful"
	);
};
