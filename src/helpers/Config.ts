
import path from "path";

import { Env } from "../types/Constants";

export class Config {
	static readonly NODE_ENV = <Env>process.env.NODE_ENV ?? Env.dev;

	// generic
	static readonly IS_PROD = (process.env.IS_PROD == Env.prod) ? true : false;
	static readonly IS_COMPILED = path.extname(__filename).includes("js");

	// discord
	static readonly BOT_TOKEN = process.env.BOT_TOKEN as string;
	static readonly SERVER_ID = "689463685566955566";

	// db
	static readonly DB_URL = process.env.DATABASE_URL as string;
	static readonly DB_TYPE = process.env.DB_TYPE as string;
	static readonly DB_HOST = process.env.DB_HOST as string;
	static readonly DB_PORT = parseInt(process.env.DB_PORT as string);
	static readonly DB_USERNAME = process.env.DB_USERNAME as string;
	static readonly DB_PASSWORD = process.env.DB_PASSWORD as string;
	static readonly DB_NAME = process.env.DB_NAME as string;
	static readonly DB_SYNC = process.env.DB_SYNC == "true";
	static readonly DB_LOGGING = process.env.DB_LOGGING == "true";

	// auth
	static readonly BACKEND_TOKEN = process.env.BACKEND_TOKEN as string;
	static readonly APPCODE = process.env.APPCODE as string;

	// google
	static readonly GOOGLE_API_KEY = process.env.GOOGLE_API_KEY as string;
	static readonly GOOGLE_CX_KEY = process.env.GOOGLE_CX_KEY as string;

	// youtube
	static readonly YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY as string;

	static Validate() {
		if (process.env.BOT_TOKEN === undefined)
			throw Error("BOT_TOKEN not specified");
		else if (process.env.GOOGLE_API_KEY === undefined)
			throw Error("GOOGLE_API_KEY not specified");
		else if (process.env.GOOGLE_CX_KEY === undefined)
			throw Error("GOOGLE_CX_KEY not specified");
	}
}