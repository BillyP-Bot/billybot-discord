import { Index, Entity, Column, ManyToOne } from "typeorm";
import { User } from "../models/User";

import Base from "./Base";

@Entity("Baseball")
export class Baseball extends Base {

	@Index()
	@Column()
	serverId: string;

	@Index()
	@ManyToOne(() => User, user => user.awayGames)
	awayTeam: User;

	@Index()
	@ManyToOne(() => User, user => user.homeGames, { nullable: true })
	homeTeam: User;

	@Column()
	awayTeamRuns: number = 0;

	@Column()
	homeTeamRuns: number = 0;

	@Column()
	bases: string = "000";

	@Column({ nullable: true })
	inning: string = null;

	@Column()
	outs: number = 0;

	@Column()
	gameOver: boolean = false;
}