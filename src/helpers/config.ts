import * as dotenv from "dotenv";
import path from "path";

dotenv.config();

const config = {
	SERVER_ID: <string>"689463685566955566",
	IS_COMPILED: <boolean>path.extname(__filename).includes("js"),
	IS_PROD: <boolean>(process.env.NODE_ENV == "production" ? true : false),
	BACKEND_TOKEN: <string>process.env.BACKEND_TOKEN || undefined,
	BOT_TOKEN: <string>process.env.BOT_TOKEN || undefined,
	GOOGLE_API_KEY: <string>process.env.GOOGLE_API_KEY || undefined,
	GOOGLE_CX_KEY: <string>process.env.GOOGLE_CX_KEY || undefined,
	YOUTUBE_API_KEY: <string>process.env.YOUTUBE_API_KEY || undefined
};

export const Db = {
	DB_TYPE: process.env.DB_TYPE,
	DB_HOST: process.env.DB_HOST,
	DB_PORT: parseInt(process.env.DB_PORT as string),
	DB_USERNAME: process.env.DB_USERNAME,
	DB_PASSWORD: process.env.DB_PASSWORD,
	DB_NAME: process.env.DB_NAME,
	DB_SYNC: process.env.DB_SYNC == "true",
	DB_LOGGING: process.env.DB_LOGGING == "true"
};

if (config.BOT_TOKEN === undefined)
	throw Error("BOT_TOKEN not specified");
else if (config.GOOGLE_API_KEY === undefined)
	throw Error("GOOGLE_API_KEY not specified");
else if (config.GOOGLE_CX_KEY === undefined)
	throw Error("GOOGLE_CX_KEY not specified");

export default config;