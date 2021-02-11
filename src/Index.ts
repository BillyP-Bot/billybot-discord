import { Client, Guild, Message } from "discord.js";
import { CronJob } from "cron";

import config from "./helpers/config";
import logger from "./services/logger";

import * as message from "./methods/messages";
import * as boyd from "./methods/boyd";
import * as dianne from "./methods/dianne";
import * as rockandroll from "./methods/rockandroll";
import * as skistats from "./methods/skiStats";
import * as whatshowardupto from "./methods/whatshowardupto";
import * as anthony from "./methods/anthony";
import * as kyle from "./methods/kyle";

const client: Client = new Client();

const triggersAndResponses: string[][] = [
	["!loop", "no !loop please"],
	["vendor", "Don't blame the vendor!"],
	["linear", "We have to work exponentially, not linearly!"]
];

//const commandsAndResponses: string[][] = [
//	["!Dianne", "Posts just one bad meme"],
//	["!FridayFunnies", "Posts a bunch of boomer memes"],
//	["!whereshowwie?", "Gets Employment Status of Howard"]
//];

let kanyePosted: number = 0;

//const clearKanyeFlagCronJob: CronJob = new CronJob("0 0 12 * * 5", function () {
//	kanyePosted = 0;
//	logger.info("Kanye flag cleared");
//});

//clearKanyeFlagCronJob.start();

//const postKanyeCronJob: CronJob = new CronJob("0 0 16 * * 5", function () {
//	if (kanyePosted === 0) {
//		anthony.goodFridayBot(client, YOUTUBE_API_KEY);
//	} else {
//		logger.info("Kanye was already posted");
//	}
//});

//postKanyeCronJob.start();

const itsTimeToRockandRoll: CronJob = new CronJob("0 0 9 * * 1", () => {
	rockandroll.itsTime(client);
}, null, null, "America/New_York");

client.on("guildCreate", (guild: Guild) => {
	guild.owner.send(`Thanks for adding me to ${guild.name}!\nCommands are very simple, just type !help in your server!`);
});

client.on("ready", () => {
	logger.info(`Logged in as ${client.user.tag}!`);
	client.user.setAvatar("https://cdn.discordapp.com/emojis/694721037006405742.png?v=1");
	client.user.setActivity("Farmville");
	itsTimeToRockandRoll.start();
});

client.on("message", (msg: Message) => {
	message.adminMsg(msg, client);
	message.includesAndResponse(msg, triggersAndResponses);
	boyd.townRoad(msg);
	skistats.all(msg);
	boyd.exitStream(msg);
	dianne.fridayFunny(msg);
	dianne.fridayFunnies(msg);
	whatshowardupto.howardUpdate(msg, config.GOOGLE_API_KEY, config.GOOGLE_CX_KEY);
	anthony.goodFriday(msg, config.YOUTUBE_API_KEY);
	kyle.kyleNoWorking(msg);
	kyle.getKyleCommand(msg);
	if (msg.content.includes("G.O.O.D")) {
		// eslint-disable-next-line no-unused-vars
		kanyePosted = 1;
	}
});

client.on("unhandledRejection", error => {
	logger.error("Unhanded promise rejection: ", error);
});

client.login(config.BOT_TOKEN).catch(e => {
	logger.error(e);
});