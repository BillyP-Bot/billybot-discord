import * as dotenv from "dotenv";
import path from "path";

dotenv.config();

const config = {
	IS_COMPILED: <boolean>path.extname(__filename).includes("js"),
	IS_PROD: <boolean>(process.env.NODE_ENV == "production" ? true : false),
	BOT_TOKEN: <string>process.env.BOT_TOKEN || undefined,
	GOOGLE_API_KEY: <string>process.env.GOOGLE_API_KEY || undefined,
	GOOGLE_CX_KEY: <string>process.env.GOOGLE_CX_KEY || undefined,
	YOUTUBE_API_KEY: <string>process.env.YOUTUBE_API_KEY || undefined
};

if (config.BOT_TOKEN === undefined)
	throw Error("BOT_TOKEN not specified");
else if (config.GOOGLE_API_KEY === undefined)
	throw Error("GOOGLE_API_KEY not specified");
else if (config.GOOGLE_CX_KEY === undefined)
	throw Error("GOOGLE_CX_KEY not specified");

export default config;