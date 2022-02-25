import { Index, Entity, Column, ManyToOne } from "typeorm";
import { User } from "../models/User";

import Base from "./Base";

@Entity("Blackjack")
export class Blackjack extends Base {

	@Index()
	@Column()
	serverId: string;

	@Index()
	@ManyToOne(() => User, user => user.blackjackHands)
	user: User;

	@Column()
	wager: number;

	@Column()
	deck: string;

	@Column()
	playerHand: string;

	@Column()
	dealerHand: string;

	@Column()
	latestMessageId: string
}
