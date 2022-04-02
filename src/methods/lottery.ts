import { Message, TextChannel } from "discord.js";

import { UserRepo } from "../repositories";
import { MessagesMethods } from "./messages";

export class LotteryMethods {

	private static readonly initialJackpot = 500;
	private static readonly ticketCost = 50;
	
	// !lotto
	static async GetLotteryInfo(msg: Message): Promise<void> {
		try {
			const users = await UserRepo.FindUsersInLottery(msg.guild.id);
			const entrants = users.length;
			const jackpot = LotteryMethods.initialJackpot + (users.length * LotteryMethods.ticketCost);
	
			let body = `A winner will be picked on Friday at noon! Buy a ticket today for ${LotteryMethods.ticketCost} BillyBucks!\n\n` +
			`Jackpot: ${jackpot}\n` + 
			`Entrants: ${entrants}\n\n`;
	
			users.forEach(user => {
				body += user.username + "\n";
			});
	
			MessagesMethods.ReplyWithSuccessEmbed(msg, "Weekly Lottery", body);
		} catch (error) {
			MessagesMethods.ReplyWithErrorEmbed(msg, error);
		}
	}
	
	// !buylottoticket
	static async BuyLotteryTicket(msg: Message): Promise<void> {
		try {
			const user = await UserRepo.FindOne(msg.author.id, msg.guild.id);
			if (user.inLottery) throw "You have already bought a ticket for this week's lottery!";
			if (user.billyBucks < LotteryMethods.ticketCost) throw `You're too poor for that! A lottery ticket costs ${LotteryMethods.ticketCost} BillyBucks!`;
	
			const bucksUpdated = await UserRepo.UpdateBucks(msg.author.id, msg.guild.id, - LotteryMethods.ticketCost, true);
			const statusUpdated = await UserRepo.UpdateUserInLotteryStatus(user.userId, true, msg.guild.id);
	
			const body = `You bought a lottery ticket for ${LotteryMethods.ticketCost} BillyBucks! A winner will be picked on Friday at noon!`;
	
			if (bucksUpdated && statusUpdated) MessagesMethods.ReplyWithSuccessEmbed(msg, "Lottery Ticket Purchased", body);
		} catch (error) {
			MessagesMethods.ReplyWithErrorEmbed(msg, error);
		}
	}
	
	// Called every Friday at noon via cron job
	static async DrawLotteryWinner(serverId: string, channel: TextChannel): Promise<void> {
		const users = await UserRepo.FindUsersInLottery(serverId);
		let message: string;
		if (!users || users.length === 0) {
			message = "No lottery entrants this week!\n\nRun ```!buylottoticket``` to buy a ticket for next week's lottery!";
		} else {
			const winner = users[Math.floor(Math.random() * users.length)];
			const jackpot = LotteryMethods.initialJackpot + (users.length * LotteryMethods.ticketCost);
	
			await UserRepo.UpdateBucks(winner.userId, serverId, jackpot, true);
	
			users.forEach(async user => {
				await UserRepo.UpdateUserInLotteryStatus(user.userId, false, serverId);
			});
	
			channel.send(`Congratulations, <@${winner.userId}>!`);
			message = `You win this week's lottery and collect the jackpot of ${jackpot} BillyBucks!`;
		}
		MessagesMethods.SendSuccessEmbed(channel, "Weekly Lottery", message);
	}
}
