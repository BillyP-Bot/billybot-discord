import { Loan, User } from "../models";
import { UserRepo } from "../repositories";
import { ILoanList } from "../types/Abstract";

export class LoanRepository {

	public static async FindOne(id: number, serverId: string): Promise<Loan> {
		try {
			const loan = await Loan.findOne({ id, serverId });
			return loan;
		} catch (e) {
			throw Error(e);
		}
	}

	public static async FindActiveLoanForUser(user: User, serverId: string): Promise<Loan> {
		try {
			const loan = await Loan.findOne({ user, serverId, closedInd: false });
			return loan;
		} catch (e) {
			throw Error(e);
		}
	}

	public static async FindAllActiveLoans(serverId: string): Promise<Loan[]> {
		try {
			return await Loan.find({ serverId, closedInd: false });
		} catch (e) {
			throw Error(e);
		}
	}

	public static async InsertOne(member: ILoanList, user: User): Promise<Loan> {
		try {
			const createdDate = new Date(), firstDueDate = new Date();
			firstDueDate.setDate(createdDate.getDate() + 7);

			const newLoan = new Loan();
			newLoan.createdAt = createdDate;
			newLoan.serverId = member.serverId;
			newLoan.originalBalanceAmt = member.amount;
			newLoan.outstandingBalanceAmt = member.amount;
			newLoan.interestRate = member.interestRate;
			newLoan.nextInterestAccrualDate = firstDueDate;
			newLoan.minPaymentAmt = member.minPaymentAmt;
			newLoan.nextPaymentDueDate = firstDueDate;
			newLoan.mostRecentPaymentDate = createdDate;

			user.hasActiveLoan = true;
			user.billyBucks += member.amount;
			user.loans.push(newLoan);

			await newLoan.save();
			await user.save();
			return newLoan;
		} catch (e) {
			throw Error(e);
		}
	}

	public static async MakePayment(loan: Loan, user: User, amount: number): Promise<boolean> {
		try {
			if (amount < 1) throw "Payment amount must be a positive number!";

			const now = new Date(), mostRecentPaymentDatePlus3 = new Date(), newMostRecentPaymentDate = new Date(), openDatePlus7 = new Date();
			newMostRecentPaymentDate.setHours(0, 0, 0, 0);
			mostRecentPaymentDatePlus3.setDate(loan.mostRecentPaymentDate.getDate() + 3);
			mostRecentPaymentDatePlus3.setHours(0, 0, 0, 0);
			openDatePlus7.setDate(loan.createdAt.getDate() + 7);
			openDatePlus7.setHours(0, 0, 0, 0);

			// full outstanding balance is being paid off
			if (amount >= loan.outstandingBalanceAmt) {
				amount = loan.outstandingBalanceAmt;
				loan.outstandingBalanceAmt = 0;
				loan.closedDate = new Date();
				loan.closedInd = true;
				user.hasActiveLoan = false;

				// credit score bonus for paying off loan 
				// (must be at least 1 week since loan was opened and have no more than one late payment penalty to reap reward)
				if (now > openDatePlus7 && loan.penaltyAmt <= Math.floor(loan.originalBalanceAmt * 0.05)) {
					user.creditScore += 20;
					user.creditScore += Math.floor(loan.interestAccruedAmt * 0.1);
				}

			// part of outstanding balance is being paid off
			} else {
				loan.outstandingBalanceAmt -= amount;

				const nextDate = new Date();
				nextDate.setDate(loan.nextPaymentDueDate.getDate() + 7);
				loan.nextPaymentDueDate = nextDate;
			}
			
			user.billyBucks -= amount;
			loan.paymentsMadeAmt += amount;
			loan.mostRecentPaymentDate = newMostRecentPaymentDate;

			// increase user's credit score (must be at least 3 days since most recent payment date to reap reward)
			if (now > mostRecentPaymentDatePlus3) user.creditScore += 10;

			// enforce credit score maximum
			if (user.creditScore > 850) user.creditScore = 850;

			await loan.save();
			await user.save();
			return true;
		} catch (e) {
			throw Error(e);
		}
	}

	public static async NightlyCycle(serverId: string): Promise<void> {
		try {
			const activeLoans = await LoanRepository.FindAllActiveLoans(serverId);
			if (!activeLoans) return;

			const today = new Date();
			console.log(`Nightly Cycle start time: ${today}`);
			const tomorrow = new Date();
			tomorrow.setDate(today.getDate() + 1);

			let loansWithLatePayments = 0, loansWithInterestAccrual = 0;
			let user;

			activeLoans.forEach(async loan => {
				let needsSave = false;

				// check for late payments
				if (tomorrow > loan.nextPaymentDueDate) {
					const penalty = Math.floor(loan.originalBalanceAmt * 0.05);
					loan.penaltyAmt += penalty;
					loan.outstandingBalanceAmt += penalty;
					loan.nextPaymentDueDate.setDate(loan.nextPaymentDueDate.getDate() + 7);
					loansWithLatePayments++;
					needsSave = true;

					// decrease user's credit score
					user = await UserRepo.FindOne(loan.user.userId, serverId);
					if (user) {
						user.creditScore -= 10;

						// enforce credit score minimum
						if (user.creditScore < 300) user.creditScore = 300;
	
						await user.save();
					}
				}

				// check for interest accrual
				if (tomorrow > loan.nextInterestAccrualDate) {
					const interestAmt = Math.floor(loan.outstandingBalanceAmt * loan.interestRate);
					loan.interestAccruedAmt += interestAmt;
					loan.outstandingBalanceAmt += interestAmt;
					loan.nextInterestAccrualDate.setDate(loan.nextInterestAccrualDate.getDate() + 7);
					loansWithInterestAccrual++;
					needsSave = true;
				}

				if (needsSave) await loan.save();
			});

			console.log(`Found ${activeLoans.length} active loan(s).`);
			if (activeLoans.length > 0) {
				console.log(`Processed late payment penalties for ${loansWithLatePayments} loan(s).`);
				console.log(`Processed interest accrual for ${loansWithInterestAccrual} loan(s)`);
			}
			console.log(`Nightly Cycle end time: ${new Date()}`);
		} catch (e) {
			throw Error(e);
		}
	}
}