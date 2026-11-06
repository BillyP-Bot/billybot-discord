const IS_PROD = process.env.NODE_ENV === "production";
const BOT_TOKEN = process.env.BOT_TOKEN;
const BILLY_BACKEND = process.env.BILLY_BACKEND;
const BILLY_BACKEND_TOKEN = process.env.BILLY_BACKEND_TOKEN;
const DASHBOARD_URL = IS_PROD
  ? "https://billybot.vercel.app/server"
  : "http://localhost:3000/server";
const GUILD_ID = process.env.GUILD_ID;

if (!BOT_TOKEN) throw new Error("BOT_TOKEN not specified");
if (!BILLY_BACKEND) throw new Error("BILLY_BACKEND not specified");
if (!BILLY_BACKEND_TOKEN) throw new Error("BILLY_BACKEND_TOKEN not specified");
if (!GUILD_ID) throw new Error("GUILD_ID not specified");

export const Config = {
  IS_PROD,
  BOT_TOKEN,
  BILLY_BACKEND,
  BILLY_BACKEND_TOKEN,
  DASHBOARD_URL,
  GUILD_ID,
};
