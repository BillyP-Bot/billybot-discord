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

		const {won, spunColor} = isWinningSpin(color);
		const potWinnings: number = setWinnings(bet, won, spunColor);
		const updated = await User.UpdateBucks(
			msg.author.id,
			msg.guild.id,
			won ? potWinnings : -potWinnings,
			true
		);

		// win
		if (won) {
			if (updated) {
				buckEmbed.setColor(Colors.green);
				buckEmbed.setTitle("You Won!");
				buckEmbed.setDescription(`It's ${spunColor}! You win ${potWinnings} BillyBucks! Lady LUUUCCCCKKK!\n\nYou now have ${bucks + potWinnings} BillyBucks.`);
				msg.reply(buckEmbed);
			}
			return;
		}

		// lose
		if (updated) {
			buckEmbed.setColor(Colors.red);
			buckEmbed.setTitle("You Lost!");
			buckEmbed.setDescription(`It's ${spunColor}! You lose your bet of ${potWinnings} BillyBucks! You're a DEAD MAAANNN!\n\nYou now have ${bucks - potWinnings} BillyBucks.`);
			msg.reply(buckEmbed);
		}
	} catch (error) {
		const errorEmbed: MessageEmbed = new MessageEmbed();
		errorEmbed.setColor(Colors.red).setTitle("Error");
		errorEmbed.setDescription(error);
		msg.reply(errorEmbed);
	}
};

const isWinningSpin = (color: string): {won: boolean, spunColor: string} => { 
	const spunColor: string = getSpinResult();
	return {
		won: spunColor === color,
		spunColor: spunColor
	};
};

const getSpinResult = (): string => {
	const rollNum: number = Math.floor(Math.random() * 37); 

	if (rollNum <= 1) {
		return "green";
	}
	else if (rollNum >= 2 && rollNum <= 19) {
		return "black";
	}
	else { // rollNum >= 20 && rollNum <= 38
		return "red";
	}
};

const setWinnings = (bet: number, won: boolean, spunColor: string): number =>{
	if (won){
		if (spunColor === "green"){
			return bet * 17;
		}
		else {
			return bet;
		}
	}
	else {
		return bet;
	}
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