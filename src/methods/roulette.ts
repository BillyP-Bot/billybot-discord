import { Message, MessageEmbed } from "discord.js";

import { Colors } from "../types/Constants";
import { UserRepository as User } from "../repositories/UserRepository";

export const spin = async (msg: Message, prefix: string): Promise<void> => {
	try {
		const buckEmbed: MessageEmbed = new MessageEmbed();
		const args: string[] = msg.content.slice(prefix.length).trim().split(" ");
		const bet: number = parseInt(args[0]);
		const color: string = args[1];

		if (!validateArgs(bet, color)) return replyWithError(msg, buckEmbed, "Invalid format! Run '!help' for proper usage.");

		if (bet < 1) return replyWithError(msg, buckEmbed, "You must bet at least 1 BillyBuck!");

		const bucks: number = await User.GetBucks(msg.author.id, msg.guild.id);

		if (bet > bucks) return replyWithError(msg, buckEmbed, `Can't bet ${bet} BillyBucks! You only have ${bucks}.`);

		const spinResult: [boolean, string] = isWinningSpin(color);
		const won: boolean = spinResult[0];
		const spunColor: string = spinResult[1];
		const updated = await User.UpdateBucks(
			msg.author.id,
			msg.guild.id,
			won ? bet : -bet,
			true
		);

		// win
		if (won) {
			if (updated) {
				buckEmbed.setColor(Colors.green);
				buckEmbed.setTitle("You Won!");
				buckEmbed.setDescription(`It's ${spunColor}! You win ${bet} BillyBucks! Lady LUUUCCCCKKK!\n\nYou now have ${bucks + bet} BillyBucks.`);
				msg.reply(buckEmbed);
			}
			return;
		}

		// lose
		if (updated) {
			buckEmbed.setColor(Colors.red);
			buckEmbed.setTitle("You Lost!");
			buckEmbed.setDescription(`It's ${spunColor}! You lose your bet of ${bet} BillyBucks! You're a DEAD MAAANNN!\n\nYou now have ${bucks - bet} BillyBucks.`);
			msg.reply(buckEmbed);
		}
	} catch (error) {
		const errorEmbed: MessageEmbed = new MessageEmbed();
		errorEmbed.setColor(Colors.red).setTitle("Error");
		errorEmbed.setDescription(error);
		msg.reply(errorEmbed);
	}
};

const isWinningSpin = (color: string): [boolean, string] => {
	return [getSpinResult() === color, color];
};

const getSpinResult = (): string => {
	const rollNum: number = Math.floor(Math.random() * 37); 
	var color: string = "";

	if (rollNum <= 1) {
		color = "green";
	}
	if (rollNum >= 2 && rollNum <= 19) {
		color = "black";
	}
	if (rollNum >= 20 && rollNum <= 38) {
		color = "red";
	}
	return color;
};

const validateArgs = (bet: number, color: string): boolean => {
	if (isNaN(bet) || (color !== "red" && color !== "black" && color !== "green")) return false;
	return true;
};

const replyWithError = (msg: Message, buckEmbed: MessageEmbed, description: string): void => {
	buckEmbed.setColor(Colors.red);
	buckEmbed.setTitle("Error");
	buckEmbed.setDescription(description);
	msg.reply(buckEmbed);
};