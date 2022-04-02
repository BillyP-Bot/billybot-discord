import { Message, MessageEmbed } from "discord.js";

import { Colors, ICreditScoreResult } from "../types";
import { Loan } from "../models";
import { LoanRepo, UserRepo } from "../repositories";

export class LendingMethods {

	static async GetActiveLoanInfo(msg: Message): Promise<void> {
		try {
			const user = await UserRepo.FindOne(msg.author.id, msg.guild.id);
			const loan = await LoanRepo.FindActiveLoanForUser(user, msg.guild.id);
			if (loan) {
				LendingMethods.ReplyWithSuccessEmbed(msg, "Active Loan Info:", LendingMethods.ShowLoanInfo(loan));
			} else {
				LendingMethods.ReplyWithErrorEmbed(msg, "No active loan found!");
			}
		} catch (error) {
			LendingMethods.ReplyWithErrorEmbed(msg, error);
		}
	}
	
	static async BookNewLoan(msg: Message, prefix: string): Promise<void> {
		try {
			const args: string[] = msg.content.slice(prefix.length).trim().split(" ");
			const amount = parseInt(args[0]);
			if (!amount || isNaN(amount)) throw "Invaid amount format!";
	
			const user = await UserRepo.FindOne(msg.author.id, msg.guild.id);
			if (user.hasActiveLoan) throw "You already have an active loan!";
	
			const minPaymentAmt = LendingMethods.CalculateMinPaymentAmount(amount);
			const creditLimitAndInterestRateInfo = LendingMethods.CalculateCreditLimitAndInterestRate(user.creditScore);
			const interestRate = creditLimitAndInterestRateInfo.interestRate;
			const creditLimit = creditLimitAndInterestRateInfo.creditLimit;
	
			if (amount < 100) throw "Amount too low! 100 BillyBucks is the minimum loan amount!";
			if (amount > creditLimit) throw `Amount too high! Your credit limit is ${creditLimit} BillyBucks.`;
	
			const newLoan = await LoanRepo.InsertOne({ userId: msg.author.id, serverId: msg.guild.id, amount, interestRate, minPaymentAmt }, user);
			if (newLoan) LendingMethods.ReplyWithSuccessEmbed(msg, "Loan Booked!", `You booked a new loan for ${amount} BillyBucks!\n\nYou now have ${user.billyBucks} BillyBucks.\n\n` + LendingMethods.ShowLoanInfo(newLoan));
		} catch (error) {
			LendingMethods.ReplyWithErrorEmbed(msg, error);
		}
	}
	
	static async GetCreditScoreInfo(msg: Message): Promise<void> {
		try {
			const user = await UserRepo.FindOne(msg.author.id, msg.guild.id);
			const creditLimitAndInterestRateInfo = LendingMethods.CalculateCreditLimitAndInterestRate(user.creditScore);
			const creditRating = creditLimitAndInterestRateInfo.creditRating;
			const interestRate = creditLimitAndInterestRateInfo.interestRate;
			const creditLimit = creditLimitAndInterestRateInfo.creditLimit;
	
			const replyBody = `Your credit score of ${user.creditScore} gives you an interest rate of ${interestRate * 100}% and a credit limit of ${creditLimit} BillyBucks on future loans!`;
			LendingMethods.ReplyWithSuccessEmbed(msg, `Your Credit Rating: ${creditRating}`, replyBody);
		} catch (error) {
			LendingMethods.ReplyWithErrorEmbed(msg, error);
		}
	}
	
	static async PayActiveLoan(msg: Message, prefix: string): Promise<void> {
		try {
			const args: string[] = msg.content.slice(prefix.length).trim().split(" ");
			let amount = parseInt(args[0]);
			if (!amount || isNaN(amount)) throw "Invaid amount format! Run '!help' for proper usage.";
	
			const user = await UserRepo.FindOne(msg.author.id, msg.guild.id);
			const loan = await LoanRepo.FindActiveLoanForUser(user, msg.guild.id);
	
			if (!loan) throw "No active loan!";
			if (amount > user.billyBucks) throw `Can't pay ${amount}! You only have ${user.billyBucks} BillyBucks.`;
			if (amount < loan.minPaymentAmt && loan.outstandingBalanceAmt > loan.minPaymentAmt) throw `Not enough! The minimum payment amount for your active loan is ${loan.minPaymentAmt} BillyBucks.`;
	
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
					body = `You made a payment of ${amount} BillyBucks toward your active loan! Well done!\n\nYou now have ${user.billyBucks} BillyBucks.\n\n` + LendingMethods.ShowLoanInfo(loan);
				}
				LendingMethods.ReplyWithSuccessEmbed(msg, title, body);
			}
	
		} catch (error) {
			LendingMethods.ReplyWithErrorEmbed(msg, error);
		}
	}
	
	private static CalculateCreditLimitAndInterestRate(creditScore: number): ICreditScoreResult {
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
	}
	
	private static CalculateMinPaymentAmount(amount: number): number {
		return Math.floor(amount / 10);
	}
	
	private static ShowLoanInfo(loan: Loan): string {
		return `Current Loan Balance: ${loan.outstandingBalanceAmt}\n` + 
		`Original Loan Balance: ${loan.originalBalanceAmt}\n` + 
		`Interest Rate: ${loan.interestRate * 100}%\n` + 
		`Interest Accrued: ${loan.interestAccruedAmt}\n` + 
		`Late Payment Penalty: ${loan.penaltyAmt}\n` + 
		`Payments Made: ${loan.paymentsMadeAmt}\n` + 
		`Minimum Payment: ${loan.minPaymentAmt}\n` + 
		`Most Recent Payment Date: ${loan.paymentsMadeAmt == 0 ? "N/A" : LendingMethods.FormatDate(loan.mostRecentPaymentDate)}\n` + 
		`Date Opened: ${LendingMethods.FormatDate(loan.createdAt)}\n` + 
		`Next Interest Accrual Date: ${LendingMethods.FormatDate(loan.nextInterestAccrualDate)}\n` + 
		`Next Payment Due Before: ${LendingMethods.FormatDate(loan.nextPaymentDueDate)}`;
	}
	
	private static ReplyWithSuccessEmbed(msg: Message, title: any, body: any): void {
		const successEmbed: MessageEmbed = new MessageEmbed();
		successEmbed.setColor(Colors.green).setTitle(title);
		successEmbed.setDescription(body);
		msg.reply(successEmbed);
	}
	
	private static ReplyWithErrorEmbed(msg: Message, error: any): void {
		const errorEmbed: MessageEmbed = new MessageEmbed();
		errorEmbed.setColor(Colors.red).setTitle("Error");
		errorEmbed.setDescription(error);
		msg.reply(errorEmbed);
	}
	
	private static FormatDate(date : Date): string {
		return date.toLocaleDateString();
	}
}
