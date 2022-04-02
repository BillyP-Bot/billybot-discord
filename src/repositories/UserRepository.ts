import { Format } from "../helpers";
import { User } from "../models";
import { IUserList } from "../types/Abstract";
import { Nums } from "../types/Constants";

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
			newUser.creditScore = 500;
			newUser.hasActiveLoan = false;

			await newUser.save();
			return true;
		} catch (e) {
			throw Error(e);
		}
	}

	public static async UpdateOne(user: User): Promise<boolean> {
		try {
			let updated;
			if (user) updated = await user.save();
			if (updated) return true;
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
				throw `you've already gotten a weekly allowance on ${Format.UTCToESTString(exists.lastAllowance)}`;
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
			if (!exists) throw ("user not found");

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
			const normalized: any[] = [];

			records.forEach(entry => {
				normalized.push({ username: entry.username, billyBucks: entry.billyBucks });
			});

			return normalized;
		} catch (e) {
			throw Error(e);
		}
	}

	public static async UpdateUserInLotteryStatus(userId: string, inLottery: boolean, serverId: string): Promise<boolean> {
		try {
			const user = await User.findOne({ where: { userId: userId, serverId: serverId } });
			if (!user) throw "User not found!";
			
			user.inLottery = inLottery;
			await user.save();
			return true;
		} catch (e) {
			throw Error(e);
		}
	}

	public static async FindUsersInLottery(serverId: string): Promise<User[]> {
		try {
			return await User.find({ serverId, inLottery: true });
		} catch (e) {
			throw Error(e);
		}
	}

	public static async GetSluggers(serverId: string): Promise<User[]> {
		try {
			const records = await User.find({
				where: {
					serverId: serverId
				},
				order: {  baseballWins: -1 },
				take: 3
			});
			const normalized: any[] = [];

			records.forEach(entry => {
				normalized.push({ userId: entry.userId, baseballWins: entry.baseballWins });
			});

			return normalized;
		} catch (e) {
			throw Error(e);
		}
	}
}