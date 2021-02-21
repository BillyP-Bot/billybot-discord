/* eslint-disable no-unused-vars */
import { IUser } from "../../models/User";
import { IUserList } from "../..//types/Abstract";

export default abstract class UserRepositoryBase {
	public abstract FindOne(id: number): Promise<IUser>;
	public abstract InsertOne(member: IUserList): Promise<boolean>;
	public abstract UpdateBucks(id: string, bucks: number): Promise<boolean>;
	public abstract Allowance(id: string, serverId: string): Promise<number>;
	public abstract GetBucks(id: string): Promise<number>;
	public abstract GetNobles(): Promise<IUser[]>;
}