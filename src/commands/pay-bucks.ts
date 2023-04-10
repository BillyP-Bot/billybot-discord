import type { ChatInputCommandInteraction } from "discord.js";
import { ApplicationCommandOptionType } from "discord.js";

import { Api, Embed, getInteractionOptionValue, getUserIdFromMentionOrUsername } from "../helpers";
import { CommandNames } from "../types/enums";

import type { IUser } from "btbot-types";
import type { ISlashCommand } from "../types";

export const payBucksCommand: ISlashCommand = {
	name: CommandNames.pay,
	description: "Pay BillyBucks directly to another user",
	options: [
		{
			name: "user",
			description: "The user to pay BillyBucks to",
			type: ApplicationCommandOptionType.User,
			required: true
		},
		{
			name: "amount",
			description: "The number of BillyBucks to pay the other user",
			type: ApplicationCommandOptionType.Integer,
			required: true,
			minValue: 1
		}
	],
	handler: async (int: ChatInputCommandInteraction) => {
		await int.deferReply();
		const user = getInteractionOptionValue<string>("user", int);
		const recipient_id = getUserIdFromMentionOrUsername(user, int.guild);
		const amount = getInteractionOptionValue<number>("amount", int);
		const embed = await payBucks(int.guild.id, int.user.id, recipient_id, amount);
		await int.editReply({ embeds: [embed] });
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
