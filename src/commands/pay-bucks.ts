import type { IUser } from "btbot-types";
import { ApplicationCommandOptionType, type ChatInputCommandInteraction } from "discord.js";

import { CommandNames } from "@enums";
import { Api, Embed, getInteractionOptionValue } from "@helpers";
import type { ISlashCommand } from "@types";

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
			min_value: 1
		}
	],
	handler: async (int: ChatInputCommandInteraction) => {
		await int.deferReply();
		const recipientId = getInteractionOptionValue<string>("user", int);
		const amount = getInteractionOptionValue<number>("amount", int);
		const embed = await payBucks(int.guild.id, int.user.id, recipientId, amount);
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
