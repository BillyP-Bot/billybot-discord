import { Loan } from "../models/Loan";
import { User } from "../models/User";
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
			let createdDate = new Date();
			let firstDueDate = new Date();
			firstDueDate.setDate(createdDate.getDate() + 7);

			const newLoan = new Loan();
			newLoan.serverId = member.serverId;
			newLoan.originalBalanceAmt = member.amount;
			newLoan.outstandingBalanceAmt = member.amount;
			newLoan.interestRate = member.interestRate;
			newLoan.nextInterestAccrualDate = firstDueDate;
			newLoan.minPaymentAmt = member.minPaymentAmt;
			newLoan.nextPaymentDueDate = firstDueDate;
			newLoan.createdAt = createdDate;

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
			if (amount <= 0) throw "Payment amount must be a positive number!";

			// pay off outstanding balance in full
			if (amount >= loan.outstandingBalanceAmt) {
				amount = loan.outstandingBalanceAmt;
				loan.outstandingBalanceAmt = 0;
				loan.closedDate = new Date();
				loan.closedInd = true;
				user.hasActiveLoan = false;

			// pay of part of outstanding balance
			} else {
				loan.outstandingBalanceAmt -= amount;

				let nextDate = new Date();
				nextDate.setDate(nextDate.getDate() + 7);
				loan.nextPaymentDueDate = nextDate;
			}
			
			user.billyBucks -= amount;
			loan.paymentsMadeAmt += amount;

			await loan.save();
			await user.save();
			return true;
		} catch (e) {
			throw Error(e);
		}
	}

	public static async NightlyCycle(serverId: string): Promise<void> {
		try {
			const loans = await LoanRepository.FindAllActiveLoans(serverId);
			if (!loans || loans.length === 0) return;

			const today = new Date();
			const tomorrow = new Date();
			tomorrow.setDate(today.getDate() + 1);

			loans.forEach(async loan => {
				let needsSave = false;

				// check for late payments
				if (today > loan.nextPaymentDueDate) {
					const penalty = Math.floor(loan.originalBalanceAmt * 0.05);
					loan.penaltyAmt += penalty;
					loan.outstandingBalanceAmt += penalty;
					loan.nextPaymentDueDate.setDate(loan.nextInterestAccrualDate.getDate() + 7);
					needsSave = true;
				}

				// check for interest accrual
				if (tomorrow > loan.nextInterestAccrualDate) {
					const interestAmt = Math.floor(loan.outstandingBalanceAmt * loan.interestRate);
					loan.interestAccruedAmt += interestAmt;
					loan.outstandingBalanceAmt += interestAmt;
					loan.nextInterestAccrualDate.setDate(loan.nextInterestAccrualDate.getDate() + 7);
					needsSave = true;
				}

				if (needsSave) await loan.save();
			});
		} catch (e) {
			throw Error(e);
		}
	}
}