import Base from "./abstract/UserRepositoryBase";
import _User, { IUser } from "../models/User";

class UserRepository extends Base {

	public async FindOne(id: number): Promise<IUser> {
		try {
			const user: IUser = await _User.findOne({ id: id }).lean();
			if (!user) throw "user not found";

			return user;
		} catch (e) {
			throw Error(e);
		}
	}
}

export const User: Base = new UserRepository;