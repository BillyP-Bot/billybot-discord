import { Message, MessageEmbed } from "discord.js";

import { Colors } from "../types/Constants";
import { Loan } from "../models/Loan";
import { LoanRepository as LoanRepo } from "../repositories/LoanRepository";
import { UserRepository as UserRepo } from "../repositories/UserRepository";
import { ICreditScoreResult } from "../types/Abstract";

export const getActiveLoanInfo = async (msg: Message): Promise<void> => {
	try {
		const user = await UserRepo.FindOne(msg.author.id, msg.guild.id);
		const loan = await LoanRepo.FindActiveLoanForUser(user, msg.guild.id);
		if (loan) {
			replyWithSuccessEmbed(msg, "Active Loan Info:", showLoanInfo(loan));
		} else {
			replyWithErrorEmbed(msg, "No active butt found!");
		}
	} catch (error) {
		replyWithErrorEmbed(msg, error);
	}
};

export const bookNewLoan = async (msg: Message, prefix: string): Promise<void> => {
	try {
		const args: string[] = msg.content.slice(prefix.length).trim().split(" ");
		const amount = parseInt(args[0]);
		if (!amount || isNaN(amount)) throw "Invaid amount format!";

		const user = await UserRepo.FindOne(msg.author.id, msg.guild.id);
		if (user.hasActiveLoan) throw "You already have an active loan!";

		const minPaymentAmt = calculateMinPaymentAmount(amount);
		const creditLimitAndInterestRateInfo = calculateCreditLimitAndInterestRate(user.creditScore);
		const interestRate = creditLimitAndInterestRateInfo.interestRate;
		const creditLimit = creditLimitAndInterestRateInfo.creditLimit;

		if (amount < 100) throw "Amount too low! 100 BillyBucks is the minimum loan amount!";
		if (amount > creditLimit) throw `Amount too high! Your credit limit is ${creditLimit} BillyBucks.`;

		const newLoan = await LoanRepo.InsertOne({ userId: msg.author.id, serverId: msg.guild.id, amount, interestRate, minPaymentAmt }, user);
		if (newLoan) replyWithSuccessEmbed(msg, "Loan Booked!", `You booked a new loan for ${amount} BillyBucks!\n\nYou now have ${user.billyBucks} BillyBucks.\n\n` + showLoanInfo(newLoan));
	} catch (error) {
		replyWithErrorEmbed(msg, error);
	}
};

export const getCreditScoreInfo = async (msg: Message): Promise<void> => {
	try {
		const user = await UserRepo.FindOne(msg.author.id, msg.guild.id);
		const creditLimitAndInterestRateInfo = calculateCreditLimitAndInterestRate(user.creditScore);
		const creditRating = creditLimitAndInterestRateInfo.creditRating;
		const interestRate = creditLimitAndInterestRateInfo.interestRate;
		const creditLimit = creditLimitAndInterestRateInfo.creditLimit;

		const replyBody = `Your credit score of ${user.creditScore} gives you an interest rate of ${interestRate * 100}% and a credit limit of ${creditLimit} BillyBucks on future loans!`;
		replyWithSuccessEmbed(msg, `Your Credit Rating: ${creditRating}`, replyBody);
	} catch (error) {
		replyWithErrorEmbed(msg, error);
	}
};

export const payActiveLoan = async (msg: Message, prefix: string): Promise<void> => {
	try {
		const args: string[] = msg.content.slice(prefix.length).trim().split(" ");
		let amount = parseInt(args[0]);
		if (!amount || isNaN(amount)) throw "Invaid amount format! Run '!help' for proper usage.";

		const user = await UserRepo.FindOne(msg.author.id, msg.guild.id);
		const loan = await LoanRepo.FindActiveLoanForUser(user, msg.guild.id);

		if (!loan) throw "No active loan!";
		if (amount > user.billyBucks) throw `Can't pay ${amount}! You only have ${user.billyBucks} BillyBucks.`;
		if (amount < loan.minPaymentAmt) throw `Not enough! The minimum payment amount for your active loan is ${loan.minPaymentAmt} BillyBucks.`;

		let paidOff = false;
		if (amount >= loan.outstandingBalanceAmt) {
			amount = loan.outstandingBalanceAmt;
			paidOff = true;
		}
			
		const paid = await LoanRepo.MakePayment(loan, user, amount);
		if (paid) {
			let title, body;
			if (paidOff) {
				title = "Loan Closed!";
				body = `You paid off the outstanding balance of ${amount} BillyBucks on your active loan and closed it out! HOT DoooOOOGGG!\n\nYou now have ${user.billyBucks} BillyBucks.`;
			} else {
				title = "Payment Processed!";
				body = `You made a payment of ${amount} BillyBucks toward your active loan! Well done!\n\nYou now have ${user.billyBucks} BillyBucks.\n\n` + showLoanInfo(loan);
			}
			replyWithSuccessEmbed(msg, title, body);
		}

	} catch (error) {
		replyWithErrorEmbed(msg, error);
	}
};

const calculateCreditLimitAndInterestRate = (creditScore: number): ICreditScoreResult => {
	let creditRating, creditLimit, interestRate;
	if (creditScore >= 300 && creditScore < 350) {
		creditRating = "Very Poor";
		creditLimit = 500;
		interestRate = 0.05;
	} else if (creditScore >= 350 && creditScore < 450) {
		creditRating = "Poor";
		creditLimit = 1000;
		interestRate = 0.04;
	} else if (creditScore >= 450 && creditScore < 550) {
		creditRating = "Neutral";
		creditLimit = 2000;
		interestRate = 0.03;
	} else if (creditScore >= 550 && creditScore < 650) {
		creditRating = "Fair";
		creditLimit = 3000;
		interestRate = 0.02;
	} else if (creditScore >= 650 && creditScore < 750) {
		creditRating = "Good";
		creditLimit = 4000;
		interestRate = 0.01;
	} else if (creditScore >= 750 && creditScore <= 850) {
		creditRating = "Excellent";
		creditLimit = 5000;
		interestRate = 0.005;
	} else {
		throw `Credit score of ${creditScore} is outside of valid range! (300 thru 850)`;
	}
	return { creditRating, interestRate, creditLimit };
};

const calculateMinPaymentAmount = (amount: number): number => {
	return Math.floor(amount / 10);
};

const showLoanInfo = (loan: Loan): string => {
	return `Current Loan Balance: ${loan.outstandingBalanceAmt}\n` + 
	`Original Loan Balance: ${loan.originalBalanceAmt}\n` + 
	`Interest Rate: ${loan.interestRate * 100}%\n` + 
	`Interest Accrued: ${loan.interestAccruedAmt}\n` + 
	`Late Payment Penalty: ${loan.penaltyAmt}\n` + 
	`Payments Made: ${loan.paymentsMadeAmt}\n` + 
	`Minimum Payment: ${loan.minPaymentAmt}\n` + 
	`Most Recent Payment Date: ${loan.paymentsMadeAmt == 0 ? "N/A" : formatDate(loan.mostRecentPaymentDate)}\n` + 
	`Date Opened: ${formatDate(loan.createdAt)}\n` + 
	`Next Interest Accrual Date: ${formatDate(loan.nextInterestAccrualDate)}\n` + 
	`Next Payment Due Date: ${formatDate(loan.nextPaymentDueDate)}`;
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

const formatDate = (date : Date): string => {
	return new Date(date.getTime()).toLocaleDateString();
};