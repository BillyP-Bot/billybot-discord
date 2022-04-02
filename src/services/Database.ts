import path from "path";
import { cwd } from "process";
import { Connection, ConnectionOptions, createConnection, getConnection } from "typeorm";

import { Config}  from "../helpers";
import { Log } from "./";

export class Database {

	private static readonly BaseOrm = {
		name: "default",
		type: Config.DB_TYPE,
		synchronize: Config.DB_SYNC,
		logging: Config.DB_LOGGING,
		autoReconnect: true,
		reconnectTries: 5,
		reconnectInterval: 2000,
		entities: [path.join(cwd(), "build/models/**/*.js")]
	}

	private static readonly Orm = {
		...Database.BaseOrm,
		ssl: true,
		extra: { ssl: { rejectUnauthorized: false } },
		url: Config.DB_URL
	} as ConnectionOptions;

	private static readonly OrmLocal = {
		...Database.BaseOrm,
		host: Config.DB_HOST,
		port: Config.DB_PORT,
		username: Config.DB_USERNAME,
		password: Config.DB_PASSWORD,
		database: Config.DB_NAME,
		ssl: false
	} as ConnectionOptions;

	public static async Connect(): Promise<void> {

		let connection: Connection | undefined;
		try {
			connection = getConnection();
		} catch (e) {
			Log.Error(`no existing connection found: ${e}`, "Database");
		}

		try {
			if (connection) {
				if (!connection.isConnected)
					await connection.connect();
			} else
				await createConnection(Config.IS_PROD ? Database.Orm : Database.OrmLocal);
			Log.Info(" successfully connected to database", "Database");
		} catch (e) {
			throw new Error(`error connecting to database: ${e}`);
		}
	}

	public static async Close(): Promise<void> {
		const conn = getConnection();
		await conn.close();
		Log.Info("[Database] Closed connection.");
	}
}