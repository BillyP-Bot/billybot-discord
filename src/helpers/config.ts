export const config = {
	IS_PROD: Bun.env.NODE_ENV === "production",
	BOT_TOKEN: Bun.env.BOT_TOKEN,
	BILLY_BACKEND: Bun.env.BILLY_BACKEND,
	BILLY_BACKEND_TOKEN: Bun.env.BILLY_BACKEND_TOKEN,
	DASHBOARD_URL:
		Bun.env.NODE_ENV === "production"
			? "https://billybot.vercel.app/server"
			: "http://localhost:3000/server"
};

if (!config.BOT_TOKEN) throw Error("BOT_TOKEN not specified");
if (!config.BILLY_BACKEND) throw Error("BILLY_BACKEND not specified");
if (!config.BILLY_BACKEND_TOKEN) throw Error("BILLY_BACKEND_TOKEN not specified");
