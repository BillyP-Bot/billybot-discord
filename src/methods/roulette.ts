import { Message, MessageEmbed } from "discord.js";

import { Colors } from "../types";
import { UserRepo } from "../repositories";
import { MessagesMethods } from "./messages";

export class RouletteMethods {

	static async Spin(msg: Message, prefix: string): Promise<void> {
		try {
			const args: string[] = msg.content.slice(prefix.length).trim().split(" ");
			const bet: number = parseInt(args[0]);
			const color: string = args[1];
			
			if (!RouletteMethods.ValidateArgs(bet, color)) return MessagesMethods.ReplyWithErrorEmbed(msg, "Invalid format! Run '!help' for proper usage.");
			
			if (bet < 1) return MessagesMethods.ReplyWithErrorEmbed(msg, "You must bet at least 1 BillyBuck!");
			
			const bucks: number = await UserRepo.GetBucks(msg.author.id, msg.guild.id);
			
			if (bet > bucks) return MessagesMethods.ReplyWithErrorEmbed(msg, `Can't bet ${bet} BillyBucks! You only have ${bucks}.`);
			
			const {won, spunColor} = RouletteMethods.IsWinningSpin(color);
			const potWinnings: number = RouletteMethods.SetWinnings(bet, won, spunColor);
			const updated = await UserRepo.UpdateBucks(
				msg.author.id,
				msg.guild.id,
				won ? potWinnings : -potWinnings,
				true
			);
				
			const buckEmbed: MessageEmbed = new MessageEmbed();
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
	}
	
	private static IsWinningSpin(color: string): {won: boolean, spunColor: string} { 
		const spunColor: string = RouletteMethods.GetSpinResult();
		return {
			won: spunColor === color,
			spunColor: spunColor
		};
	}
	
	private static GetSpinResult(): string {
		// produces random int 0 thru 37 inclusive (38 total distinct outcomes)
		const rollNum: number = Math.floor(Math.random() * 38);
	
		// 0 thru 1 inclusive (2 distinct outcomes)
		if (rollNum <= 1) {
			return "green";
		}
		// 2 thru 19 inclusive (18 distinct outcomes)
		else if (rollNum >= 2 && rollNum <= 19) {
			return "black";
		}
		// 20 thru 37 inclusive (18 distinct outcomes)
		else {
			return "red";
		}
	}
	
	private static SetWinnings(bet: number, won: boolean, spunColor: string): number {
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
	}
	
	private static ValidateArgs(bet: number, color: string): boolean {
		if (isNaN(bet) || (color !== "red" && color !== "black" && color !== "green")) return false;
		return true;
	}
}
