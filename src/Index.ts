import { Client, GuildMember, Guild, Collection, Message } from "discord.js";
import { CronJob } from "cron";

import config from "./helpers/config";
import logger from "./services/logger";

import connect from "./services/db";
import { User } from "./repositories/UserRepository";
import * as message from "./methods/messages";
import * as boyd from "./methods/boyd";
import * as currency from "./methods/currency";
import * as dianne from "./methods/dianne";
import * as rockandroll from "./methods/rockandroll";
import * as skistats from "./methods/skiStats";
import * as whatshowardupto from "./methods/whatshowardupto";
import * as kyle from "./methods/kyle";
import { IUserList } from "./types/Abstract";

const client: Client = new Client();
const serverId: string = "730228346025148486";

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

const itsTimeToRockandRoll: CronJob = new CronJob("0 0 9 * * 1", () => {
	rockandroll.itsTime(client);
}, null, null, "America/New_York");

client.on("guildCreate", (guild: Guild) => {
	guild.owner.send(`Thanks for adding me to ${guild.name}!\nCommands are very simple, just type !help in your server!`);
});

let notBot: IUserList[] = [];
client.on("ready", async () => {

	const members: Collection<string, GuildMember> = client.guilds.cache.find(a => a.id == serverId).members.cache;
	const notBots: Collection<string, GuildMember> = members.filter(a => a.user.bot == false);
	notBots.forEach(mem => notBot.push({ username: mem.user.username, id: mem.user.id }));

	for (let i = 0; i < notBot.length; i++) {
		try {
			await User.InsertOne({ username: notBot[i].username, id: notBot[i].id });
		} catch (error) {
			console.log(error);
		}
	}

	logger.info(`Logged in as ${client.user.tag}!`);
	// client.user.setAvatar("https://cdn.discordapp.com/emojis/694721037006405742.png?v=1");
	client.user.setActivity("Farmville");
	itsTimeToRockandRoll.start();
});

const townRoad: RegExp = /.*!boydTownRoad.*/gmi;
const exitStream: RegExp = /.*!stop.*/gmi;
const skiStats: RegExp = /.*(!skistats).*/gmi;
const fridayFunny: RegExp = /.*!diane.*/gmi;
const fridayFunnies: RegExp = /.*!fridayfunnies*/gmi;
const bucksReg: RegExp = /.*!bucks*/gmi;
const getNobles: RegExp = /.*!noblemen*/gmi;
const howardUpdate: RegExp = /.*!whereshowwie*/gmi; //TODO: other commands
//const kyleCommand : RegExp = /.*!drink*/gmi; TODO
//TODO Includes and responses

client.on("message", (msg: Message) => {
	switch (true) {
	case skiStats.test(msg.content) && !msg.author.bot:
		skistats.all(msg);
		break;
	case bucksReg.test(msg.content) && !msg.author.bot:
		currency.checkBucks(msg, "!bucks");
		break;
	case getNobles.test(msg.content) && !msg.author.bot:
		currency.getNobles(msg);
		break;
	case townRoad.test(msg.content) && !msg.author.bot:
		boyd.townRoad(msg);
		break;
	case exitStream.test(msg.content) && !msg.author.bot:
		boyd.exitStream(msg);
		break;
	case fridayFunny.test(msg.content) && !msg.author.bot:
		dianne.fridayFunny(msg);
		break;
	case fridayFunnies.test(msg.content) && !msg.author.bot:
		dianne.fridayFunnies(msg);
		break;
	case howardUpdate.test(msg.content) && !msg.author.bot:
		whatshowardupto.howardUpdate(msg, config.GOOGLE_API_KEY, config.GOOGLE_CX_KEY);
		break;
	case msg.channel.type !== "dm" && msg.channel.name === "admin-announcements":
		message.adminMsg(msg, client);
		break;
	default:
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