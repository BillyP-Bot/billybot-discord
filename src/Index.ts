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
import * as kyle from "./methods/kyle";

const client: Client = new Client();

const triggersAndResponses: string[][] = [
	["!loop", "no !loop please"],
	["vendor", "Don't blame the vendor!"],
	["linear", "We have to work exponentially, not linearly!"]
];

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

const adminMsg : RegExp = /.*(!adminmsg).*/gmi;
const townRoad : RegExp = /.*!boydTownRoad.*/gmi;
const exitStream : RegExp = /.*!stop.*/gmi;
const skiStats : RegExp = /.*(!skistats).*/gmi;
const fridayFunny : RegExp = /.*!diane.*/gmi;
const fridayFunnies : RegExp = /.*!fridayfunnies*/gmi;
const howardUpdate : RegExp = /.*!whereshowwie*/gmi; //TODO: other commands
//const kyleCommand : RegExp = /.*!drink*/gmi; TODO
//TODO Includes and responses

client.on("message", (msg: Message) => {
	if (adminMsg.test(msg.content)){
		message.adminMsg(msg, client);
	}else if (skiStats.test(msg.content)){
		skistats.all(msg);
	}else if (townRoad.test(msg.content)){
		boyd.townRoad(msg);
	}else if (exitStream.test(msg.content)){
		boyd.exitStream(msg);
	}else if (fridayFunny.test(msg.content)){
		dianne.fridayFunny(msg);
	}else if (fridayFunnies.test(msg.content)){
		dianne.fridayFunnies(msg);
	}else if (howardUpdate.test(msg.content)){
		whatshowardupto.howardUpdate(msg, config.GOOGLE_API_KEY, config.GOOGLE_CX_KEY);
	}else {
		message.includesAndResponse(msg, triggersAndResponses);
		kyle.kyleNoWorking(msg);
		kyle.getKyleCommand(msg);
	}
});

client.on("unhandledRejection", error => {
	logger.error("Unhanded promise rejection: ", error);
});

client.login(config.BOT_TOKEN).catch(e => {
	logger.error(e);
});