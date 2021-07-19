import { Index, Entity, Column } from "typeorm";

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
	billyBucks: number;

	@Column()
	lastAllowance: Date;
}
