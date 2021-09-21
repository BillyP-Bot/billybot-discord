import path from "path";
import { cwd } from "process";
import { Connection, ConnectionOptions, createConnection, getConnection } from "typeorm";

import { User } from "../models/User";
import Config, { Db } from "../helpers/config";
import Log  from "./logger";

export class Database {

	private static readonly Orm = {
		name: "default",
		url: Db.DB_URL,
		type: Db.DB_TYPE,
		// host: Config.IS_PROD ? undefined : Db.DB_HOST,
		// port: Config.IS_PROD ? undefined : Db.DB_PORT,
		// username: Config.IS_PROD ? undefined : Db.DB_USERNAME,
		// password: Config.IS_PROD ? undefined : Db.DB_PASSWORD,
		// database: Config.IS_PROD ? undefined : Db.DB_NAME,
		synchronize: Db.DB_SYNC,
		logging: Db.DB_LOGGING,
		autoReconnect: true,
		reconnectTries: 5,
		//ssl: { rejectUnauthorized: false },
		ssl: true,
		extra: { ssl: { rejectUnauthorized: false } },
		reconnectInterval: 2000,
		entities: [path.join(cwd(), "build/models/**/*.js")]
		//entities: [ User ]
	} as ConnectionOptions;

	public static async Connect(): Promise<void> {

		let connection: Connection | undefined;
		try {
			connection = getConnection();
		} catch (e) {
			Log.error(`no existing connection found: ${e}`, "Database");
		}

		try {
			if (connection) {
				if (!connection.isConnected)
					await connection.connect();
			} else
				await createConnection(Database.Orm);
			Log.info(" successfully connected to database", "Database");
		} catch (e) {
			throw new Error(`error connecting to database: ${e}`);
		}
	}

	public static async Close(): Promise<void> {
		try {
			const conn = getConnection();
			await conn.close();
		} catch (e) {
			throw new Error(e);
		}
	}
}