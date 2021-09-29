import { Loan } from "../models/Loan";
import { User } from "../models/User";
import { ILoanList } from "../types/Abstract";

export class LoanRepository {

	public static async FindOne(id: number, serverId: string): Promise<Loan> {
		try {
			const loan = await Loan.findOne({ id, serverId });
			if (!loan) throw "Loan not found!";

			return loan;
		} catch (e) {
			throw Error(e);
		}
	}

	public static async FindActiveLoanForUser(user: User, serverId: string): Promise<Loan> {
		try {
			const loan = await Loan.findOne({ user, serverId, closedInd: false });
			if (!loan) throw "No active loan!";

			return loan;
		} catch (e) {
			throw Error(e);
		}
	}

	public static async InsertOne(member: ILoanList, user: User): Promise<Loan> {
		try {
			let firstDate = new Date();
			firstDate.setDate(firstDate.getDate() + 7);

			const newLoan = new Loan();
			newLoan.serverId = member.serverId;
			newLoan.originalBalanceAmt = member.amount;
			newLoan.outstandingBalanceAmt = member.amount;
			newLoan.interestRate = member.interestRate;
			newLoan.nextInterestAccrualDate = firstDate;
			newLoan.minPaymentAmt = member.minPaymentAmt;
			newLoan.nextPaymentDueDate = firstDate;

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

			if (amount >= loan.outstandingBalanceAmt) {
				amount = loan.outstandingBalanceAmt;
				loan.outstandingBalanceAmt = 0;
				loan.closedDate = new Date();
				loan.closedInd = true;
				user.hasActiveLoan = false;
			} else {
				loan.outstandingBalanceAmt -= amount;

				let nextDate = new Date();
				nextDate.setDate(nextDate.getDate() + 7);
				loan.nextPaymentDueDate = nextDate;
			}
			
			user.billyBucks -= amount;

			await loan.save();
			await user.save();
			return true;
		} catch (e) {
			throw Error(e);
		}
	}
}