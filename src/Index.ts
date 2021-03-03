/* eslint-disable indent */
import { Client, Guild, Intents, Message } from "discord.js";

import config from "./helpers/config";
import logger from "./services/logger";

import connect from "./services/db";
import CronJobs from "./methods/cronJobs";
import Currency from "./methods/currency";
import Generic from "./methods/generic";
import { Images, Activities } from "./types/Constants";
import * as message from "./methods/messages";
import * as boyd from "./methods/boyd";
import * as dianne from "./methods/dianne";
import * as skistats from "./methods/skiStats";
import * as whatshowardupto from "./methods/whatshowardupto";
import * as kyle from "./methods/kyle";

const intents: Intents = new Intents();
intents.add(Intents.ALL);
const client: Client = new Client();
// instantiate all cronjobs
const Jobs: CronJobs = new CronJobs(client);

try {
	connect();
} catch (error) {
	logger.info(error);
}

const triggersAndResponses: string[][] = [
	["!loop", "no !loop please"],
	["vendor", "Don't blame the vendor!"],
	["linear", "We have to work exponentially, not linearly!"]
];

client.on("guildCreate", (guild: Guild) => {
	guild.owner.send(`Thanks for adding me to ${guild.name}!\nCommands are very simple, just type !help in your server!`);
});

client.on("ready", () => {
	logger.info(`Logged in as ${client.user.tag}!`);
	client.user.setAvatar(Images.billyMad);
	client.user.setActivity(Activities.farmville);
	Jobs.RollCron.start();
});

client.on("message", (msg: Message) => {
	try {
	if(msg.author.bot) return;

	switch (true) {
		case /.*(!help).*/gmi.test(msg.content):
			Generic.Help(msg);
			break;
		case /.*(!skistats).*/gmi.test(msg.content):
			skistats.all(msg);
			break;
		case /.*!bucks*/gmi.test(msg.content):
			Currency.CheckBucks(msg, "!bucks");
			break;
		case /.*!configure*/gmi.test(msg.content):
			Currency.Configure(client, msg);
			break;
		case /.*!allowance*/gmi.test(msg.content):
			Currency.Allowance(msg);
			break;
		case /.*!boydTownRoad.*/gmi.test(msg.content):
			boyd.townRoad(msg);
			break;
		case /.*!stop.*/gmi.test(msg.content):
			boyd.exitStream(msg);
			break;
		case /.*!diane.*/gmi.test(msg.content):
			dianne.fridayFunny(msg);
			break;
		case /.*!fridayfunnies*/gmi.test(msg.content):
			dianne.fridayFunnies(msg);
			break;
		case /.*!whereshowwie*/gmi.test(msg.content):
			whatshowardupto.howardUpdate(msg, config.GOOGLE_API_KEY, config.GOOGLE_CX_KEY);
			break;
		case msg.channel.type !== "dm" && msg.channel.name === "admin-announcements":
			message.adminMsg(msg, client);
			break;
		case /.*good bot*/gmi.test(msg.content):
			message.goodBot(msg);
			break;
		case /.*bad bot*/gmi.test(msg.content):
			message.badBot(msg);
			break;
		default:
			message.includesAndResponse(msg, triggersAndResponses);
			kyle.kyleNoWorking(msg);
			kyle.getKyleCommand(msg);
	}
} catch (error) {
	console.log(error);
}
});

client.on("unhandledRejection", error => {
	logger.error("Unhanded promise rejection: ", error);
});

client.login(config.BOT_TOKEN).catch(e => {
	logger.error(e);
});