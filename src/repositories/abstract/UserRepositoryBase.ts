/* eslint-disable no-unused-vars */
import { IUser } from "../../models/User";

export default abstract class UserRepositoryBase {
	public abstract FindOne(id: number): Promise<IUser>;
}