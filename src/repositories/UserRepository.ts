import { checkServerIdentity } from "tls";
import { User } from "../models/User";
import { IUserList } from "../types/Abstract";
import { Nums } from "../types/Constants";

import UserNotFoundError from "../types/Errors";
export class UserRepository {

	public static async FindOne(userId: string, serverId: string): Promise<User> {
		try {
			const user = await User.findOne({ userId: userId, serverId: serverId });
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

	public static async UpdateBucks(userId: string, serverId: string, bucks: number, increment: boolean): Promise<boolean> {
		try {
			const exists = await User.findOne({ where: { userId: userId, serverId: serverId } });
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
			const exists = await User.findOne({ where: { userId: userId, serverId: serverId } });
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

	public static async GetBucks(userId: string, serverId: string): Promise<number> {
		try {
			const exists = await User.findOne({ where: { userId: userId, serverId: serverId } });
			if (!exists) throw new UserNotFoundError("user not found", userId, serverId);

			return exists.billyBucks;
		} catch (e) {
			throw Error(e);
		}
	}

	public static async GetNobles(serverId: string): Promise<User[]> {
		try {
			const records = await User.find({
				where: {
					serverId: serverId
				},
				order: {  billyBucks: -1 },
				take: 3
			});
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