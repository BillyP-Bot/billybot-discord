export const config = {
	SERVER_ID: <string>"689463685566955566",
	IS_PROD: <boolean>(process.env.NODE_ENV == "production" ? true : false),
	BACKEND_TOKEN: <string>process.env.BACKEND_TOKEN || undefined,
	BOT_TOKEN: <string>process.env.BOT_TOKEN || undefined,
	APPCODE: <string>process.env.APPCODE || undefined,
	GOOGLE_API_KEY: <string>process.env.GOOGLE_API_KEY || undefined,
	GOOGLE_CX_KEY: <string>process.env.GOOGLE_CX_KEY || undefined,
	YOUTUBE_API_KEY: <string>process.env.YOUTUBE_API_KEY || undefined,
	BT_BOT_API_ENDPOINT: <string>process.env.BT_BOT_API_ENDPOINT || undefined,
	BT_BOT_AUTH_TOKEN: <string>process.env.BT_BOT_AUTH_TOKEN || undefined,
	BT_BOT_X_API_TOKEN: <string>process.env.BT_BOT_X_API_TOKEN || undefined
};

if (config.BOT_TOKEN === undefined)
	throw Error("BOT_TOKEN not specified");