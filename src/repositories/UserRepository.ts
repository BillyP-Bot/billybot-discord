import Base from "./abstract/UserRepositoryBase";
import _User, { IUser } from "../models/User";
import { IUserList } from "../types/Abstract";
import { Nums } from "../types/Constants";

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

	public async InsertOne(member: IUserList): Promise<boolean> {
		try {
			const exists: IUser = await _User.findOne({ userId: member.id });
			if (exists) return false;

			const user = new _User();
			user.isNew = true;
			user.username = member.username;
			user.userId = member.id;
			user.serverId = member.serverId;
			user.billyBucks = 500;
			user.lastAllowance = new Date();

			await user.save();
			return true;
		} catch (e) {
			throw Error(e);
		}
	}

	public async UpdateBucks(id: string, bucks: number): Promise<boolean> {
		try {
			const exists: IUser = await _User.findOne({ userId: id });
			if (!exists) return false;

			exists.isNew = false;
			exists.billyBucks = bucks;

			await exists.save();
			return true;
		} catch (e) {
			throw Error(e);
		}
	}

	public async Allowance(id: string): Promise<number> {
		try {
			const exists: IUser = await _User.findOne({ userId: id });
			if (!exists) throw "user not found";

			const timestamp: number = +new Date(exists.lastAllowance);
			const now: number = +new Date();
			if ((now - timestamp) < Nums.oneWeek) {
				throw `you've already gotten a weekly allowance on ${exists.lastAllowance}`;
			}

			exists.isNew = false;
			exists.billyBucks = exists.billyBucks + 200;
			exists.lastAllowance = new Date();

			await exists.save();
			return exists.billyBucks;
		} catch (e) {
			throw Error(e);
		}
	}

	public async GetBucks(id: string): Promise<number> {
		try {
			const exists: IUser = await _User.findOne({ userId: id });
			if (!exists) throw "user not found";

			return exists.billyBucks;
		} catch (e) {
			throw Error(e);
		}
	}

	public async GetNobles(): Promise<IUser[]> {
		try {
			const records: IUser[] = await _User.find().sort({ billyBucks: -1 }).limit(3);
			let normalized: any[] = [];

			records.forEach(entry => {
				normalized.push({ username: entry.username, billyBucks: entry.billyBucks });
			});

			return normalized;
		} catch (e) {
			throw Error(e);
		}
	}
}

export const User: Base = new UserRepository;