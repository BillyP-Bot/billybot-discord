import { Message, MessageEmbed } from "discord.js";

import { Colors } from "../types/Constants";
import { UserRepository as User } from "../repositories/UserRepository";

export const spin = async (msg: Message, prefix: string): Promise<void> => {
	try {
		const buckEmbed: MessageEmbed = new MessageEmbed();
		const args: string[] = msg.content.slice(prefix.length).trim().split(" ");
		const bet: number = parseInt(args[0]);
		const color: string = args[1];

		if (validateArgs(bet, color)) {
			const bucks: number = await User.GetBucks(msg.author.id, msg.guild.id);
			if (bet <= 0) {
				replyWithError(msg, buckEmbed, "You must bet at least 1 BillyBuck!");
			} else if (bet <= bucks) {
				const oppColor: string = color === "black" ? "red" : "black";
				let dbUpdated: boolean;
				if (isWinningSpin()) {
					//win
					dbUpdated = await User.UpdateBucks(msg.author.id, msg.guild.id, bet, true);

					if (dbUpdated) {
						buckEmbed.setColor(Colors.green);
						buckEmbed.setTitle("You Won!");
						buckEmbed.setDescription(`It's ${color}! You win ${bet} BillyBucks! Lady LUUUCCCCKKK!`);
						msg.reply(buckEmbed);
					}
					
				} else {
					//lose
					dbUpdated = await User.UpdateBucks(msg.author.id, msg.guild.id, -bet, true);

					if (dbUpdated) {
						buckEmbed.setColor(Colors.red);
						buckEmbed.setTitle("You Lost!");
						buckEmbed.setDescription(`It's ${oppColor}! You lose your bet of ${bet} BillyBucks! You're a DEAD MAAANNN!`);
						msg.reply(buckEmbed);
					}
				}
			} else {
				replyWithError(msg, buckEmbed, `Can't bet ${bet} BillyBucks! You only have ${bucks}.`);
			}
		} else {
			replyWithError(msg, buckEmbed, "Invalid format! Type '!help' for proper usage.");
		}
	} catch (error) {
		const errorEmbed: MessageEmbed = new MessageEmbed();
		errorEmbed.setColor(Colors.red).setTitle("Error");
		errorEmbed.setDescription(error);
		msg.reply(errorEmbed);
	}
};

function isWinningSpin(): boolean {
	const spinResult: number = getSpinResult();
	if (spinResult <= 18) {
		return true;
	}
	return false;
}

function validateArgs(bet: number, color: string): boolean {
	if (isNaN(bet) || (color !== "red" && color !== "black")) {
		return false;
	}
	return true;
}

function replyWithError(msg: Message, buckEmbed: MessageEmbed, description: string): void {
	buckEmbed.setColor(Colors.red);
	buckEmbed.setTitle("Error");
	buckEmbed.setDescription(description);
	msg.reply(buckEmbed);
}

function getSpinResult(): number {
	return Math.floor((Math.random() * 38) + 1);
}