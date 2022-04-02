import { Message, MessageEmbed, TextChannel } from "discord.js";
import { Colors } from "../types/Constants";

import { UserRepo } from "../repositories";

const initialJackpot = 500;
const ticketCost = 50;

// !lotto
export const getLotteryInfo = async (msg: Message): Promise<void> => {
	try {
		const users = await UserRepo.FindUsersInLottery(msg.guild.id);
		const entrants = users.length;
		const jackpot = initialJackpot + (users.length * ticketCost);

		let body = `A winner will be picked on Friday at noon! Buy a ticket today for ${ticketCost} BillyBucks!\n\n` +
		`Jackpot: ${jackpot}\n` + 
		`Entrants: ${entrants}\n\n`;

		users.forEach(user => {
			body += user.username + "\n";
		});

		replyWithSuccessEmbed(msg, "Weekly Lottery", body);
	} catch (error) {
		replyWithErrorEmbed(msg, error);
	}
};

// !buylottoticket
export const buyLotteryTicket = async (msg: Message): Promise<void> => {
	try {
		const user = await UserRepo.FindOne(msg.author.id, msg.guild.id);
		if (user.inLottery) throw "You have already bought a ticket for this week's lottery!";
		if (user.billyBucks < ticketCost) throw `You're too poor for that! A lottery ticket costs ${ticketCost} BillyBucks!`;

		const bucksUpdated = await UserRepo.UpdateBucks(msg.author.id, msg.guild.id, -ticketCost, true);
		const statusUpdated = await UserRepo.UpdateUserInLotteryStatus(user.userId, true, msg.guild.id);

		const body = `You bought a lottery ticket for ${ticketCost} BillyBucks! A winner will be picked on Friday at noon!`;

		if (bucksUpdated && statusUpdated) replyWithSuccessEmbed(msg, "Lottery Ticket Purchased", body);
	} catch (error) {
		replyWithErrorEmbed(msg, error);
	}
};

// Called every Friday at noon via cron job
export const drawLotteryWinner = async (serverId: string, channel: TextChannel): Promise<void> => {
	const users = await UserRepo.FindUsersInLottery(serverId);
	let message: string;
	if (!users || users.length === 0) {
		message = "No lottery entrants this week!\n\nRun ```!buylottoticket``` to buy a ticket for next week's lottery!";
	} else {
		const winner = users[Math.floor(Math.random() * users.length)];
		const jackpot = initialJackpot + (users.length * ticketCost);

		await UserRepo.UpdateBucks(winner.userId, serverId, jackpot, true);

		users.forEach(async user => {
			await UserRepo.UpdateUserInLotteryStatus(user.userId, false, serverId);
		});

		channel.send(`Congratulations, <@${winner.userId}>!`);
		message = `You win this week's lottery and collect the jackpot of ${jackpot} BillyBucks!`;
	}
	sendWithSuccessEmbed(channel, "Weekly Lottery", message);
};

const sendWithSuccessEmbed = (channel: TextChannel, title: any, body: any): void => {
	const successEmbed: MessageEmbed = new MessageEmbed();
	successEmbed.setColor(Colors.green).setTitle(title);
	successEmbed.setDescription(body);
	channel.send(successEmbed);
};

const replyWithSuccessEmbed = (msg: Message, title: any, body: any): void => {
	const successEmbed: MessageEmbed = new MessageEmbed();
	successEmbed.setColor(Colors.green).setTitle(title);
	successEmbed.setDescription(body);
	msg.reply(successEmbed);
};

const replyWithErrorEmbed = (msg: Message, error: any): void => {
	const errorEmbed: MessageEmbed = new MessageEmbed();
	errorEmbed.setColor(Colors.red).setTitle("Error");
	errorEmbed.setDescription(error);
	msg.reply(errorEmbed);
};