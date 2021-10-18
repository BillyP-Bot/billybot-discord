import { Index, Entity, Column, OneToMany } from "typeorm";
import { Loan } from "./Loan";
import { Baseball } from "./Baseball";

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

	@Column({ default: 500 })
	creditScore: number = 500;

	@Column({ default: false })
	hasActiveLoan: boolean = false;

	@Column({ default: false })
	inLottery: boolean = false;

	@Column({ default: false })
	inBaseballGame: boolean = false;

	@Column({ default: 0 })
	baseballWins: number = 0;

	@Column({ default: 0 })
	baseballLosses: number = 0;

	@OneToMany(() => Loan, loan => loan.user, { eager: true })
	loans: Loan[];

	@OneToMany(() => Baseball, baseball => baseball.awayTeam, { eager: true })
	awayGames: Baseball[];

	@OneToMany(() => Baseball, baseball => baseball.homeTeam, { eager: true })
	homeGames: Baseball[];
}
