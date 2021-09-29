import { Index, Entity, Column, OneToMany } from "typeorm";
import { Loan } from "./Loan";

import Base from "./Base";

@Entity("User")
export class User extends Base {

	@Index()
	@Column()
	username: string;

	@Index()
	@Column()
	userId: string;

	@Index()
	@Column()
	serverId: string;

	@Column()
	billyBucks: number = 500;

	@Column()
	lastAllowance: Date = new Date();

	@Column()
	creditScore: number = 500;

	@Column()
	hasActiveLoan: boolean = false;

	@OneToMany(() => Loan, loan => loan.user, { eager: true })
	loans: Loan[];
}
