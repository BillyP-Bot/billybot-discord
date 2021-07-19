// import Base from "./abstract/UserRepositoryBase";
import { User } from "../models/User";
import { IUserList } from "../types/Abstract";
import { Nums } from "../types/Constants";

export class UserRepository {

	public static async FindOne(id: number): Promise<User> {
		try {
			const user = await User.findOne({ id });
			if (!user) throw "user not found";

			return user;
		} catch (e) {
			throw Error(e);
		}
	}

	public static async InsertOne(member: IUserList): Promise<boolean> {
		try {
			const exists = await User.findOne({ userId: member.id, serverId: member.serverId });
			if (exists) return false;

			const newUser = new User();
			newUser.username = member.username;
			newUser.userId = member.id;
			newUser.serverId = member.serverId;
			newUser.billyBucks = 500;
			newUser.lastAllowance = new Date();

			await newUser.save();
			return true;
		} catch (e) {
			throw Error(e);
		}
	}

	public static async UpdateBucks(userId: string, bucks: number, increment: boolean): Promise<boolean> {
		try {
			const exists = await User.findOne({ userId });
			if (!exists) return false;

			if (increment)
				exists.billyBucks = exists.billyBucks + bucks;
			else
				exists.billyBucks = bucks;

			await exists.save();
			return true;
		} catch (e) {
			throw Error(e);
		}
	}

	public static async Allowance(userId: string, serverId: string): Promise<number> {
		try {
			const exists = await User.findOne({ userId, serverId });
			if (!exists) throw "user not found";

			const timestamp: number = +new Date(exists.lastAllowance);
			const now: number = +new Date();
			if ((now - timestamp) < Nums.oneWeek) {
				throw `you've already gotten a weekly allowance on ${exists.lastAllowance}`;
			}

			exists.billyBucks = exists.billyBucks + 200;
			exists.lastAllowance = new Date();

			await exists.save();
			return exists.billyBucks;
		} catch (e) {
			throw Error(e);
		}
	}

	public static async GetBucks(userId: string): Promise<number> {
		try {
			const exists = await User.findOne({ userId });
			if (!exists) throw "user not found";

			return exists.billyBucks;
		} catch (e) {
			throw Error(e);
		}
	}

	public static async GetNobles(): Promise<User[]> {
		try {
			// const records = await User.find().sort({ billyBucks: -1 }).limit(3);
			const records = await User.find({order: { 
				billyBucks: "DESC"
			}, take: 3});
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