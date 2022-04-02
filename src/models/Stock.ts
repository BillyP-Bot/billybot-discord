import { Index, Entity, Column, ManyToOne } from "typeorm";

import Base from "./Base";
import { User } from "./";

@Entity("Stock")
export class Stock extends Base {

	@Index()
	@Column()
	serverId: string;

	@Index()
	@ManyToOne(() => User, user => user.stocks)
	user: User;

	@Column()
	tickerSymbol: string;

	@Column()
	billyBucksInvested: number;

	@Column({ type: "decimal" })
	boughtAtPrice: number;
}