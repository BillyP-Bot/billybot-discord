import { User } from "./User";
import { Index, Entity, Column, ManyToOne } from "typeorm";

import Base from "./Base";

@Entity("Loan")
export class Loan extends Base {

	@Index()
	@ManyToOne(() => User, user => user.loans)
	user: User;

	@Index()
	@Column()
	serverId: string;

	@Column()
	originalBalanceAmt: number;

	@Column()
	outstandingBalanceAmt: number;

	@Column()
	interestAccruedAmt: number = 0;

	@Column()
	penaltyAmt: number = 0;

	@Column({type: "decimal"})
	interestRate: number;

	@Column()
	nextInterestAccrualDate: Date;

	@Column()
	minPaymentAmt: number;

	@Column()
	nextPaymentDueDate: Date;

	@Column({nullable: true})
	closedDate: Date;

	@Column()
	closedInd: boolean = false;
}
