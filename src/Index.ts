/* eslint-disable indent */
import "dotenv";
import "reflect-metadata";
import { Client, Guild, Intents, Message, MessageReaction } from "discord.js";

import config from "./helpers/config";
import logger from "./services/logger";

import { Database } from "./services/db";
import CronJobs from "./methods/cronJobs";
import Currency from "./methods/currency";
import Generic from "./methods/generic";
import { Images, Activities } from "./types/Constants";
import * as message from "./methods/messages";
import * as boyd from "./methods/boyd";
import * as dianne from "./methods/dianne";
import * as disc from "./methods/disc";
import * as skistats from "./methods/skiStats";
import * as whatshowardupto from "./methods/whatshowardupto";
import * as kyle from "./methods/kyle";
import * as joe from "./methods/joe";
import * as roulette from "./methods/roulette";
import * as lending from "./methods/lending";
import * as lottery from "./methods/lottery";
import * as baseball from "./methods/baseball";
import * as stocks from "./methods/stocks";

// const intents: Intents = new Intents();
// intents.add(Intents.ALL);
const client: Client = new Client({
	intents: [
		Intents.FLAGS.GUILDS,
		Intents.FLAGS.GUILD_MEMBERS,
		Intents.FLAGS.GUILD_BANS,
		Intents.FLAGS.GUILD_EMOJIS_AND_STICKERS,
		Intents.FLAGS.GUILD_INTEGRATIONS,
		Intents.FLAGS.GUILD_WEBHOOKS,
		Intents.FLAGS.GUILD_INVITES,
		Intents.FLAGS.GUILD_VOICE_STATES,
		Intents.FLAGS.GUILD_PRESENCES,
		Intents.FLAGS.GUILD_MESSAGES,
		Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
		Intents.FLAGS.GUILD_MESSAGE_TYPING,
		Intents.FLAGS.DIRECT_MESSAGES,
		Intents.FLAGS.DIRECT_MESSAGE_REACTIONS,
		Intents.FLAGS.DIRECT_MESSAGE_TYPING
	],
	partials: ["MESSAGE", "CHANNEL", "REACTION"],
});

// instantiate all cronjobs
const Jobs: CronJobs = new CronJobs(client);

(async () => {
	try {
		await Database.Connect();
	} catch (error) {
		logger.info(error);
	}
})();

const triggersAndResponses: string[][] = [
	["!loop", "no !loop please"],
	["vendor", "Don't blame the vendor!"],
	["linear", "We have to work exponentially, not linearly!"]
];

client.on("guildCreate", (guild: Guild) => {
	const owner = guild.members.cache.find(a => a.id == guild.ownerId);
	owner.send(`Thanks for adding me to ${guild.name}!\nCommands are very simple, just type !help in your server!`);
});

client.on("ready", () => {
	logger.info(`Logged in as ${client.user.tag}!`);
	client.user.setAvatar(Images.billyMad);
	client.user.setActivity(Activities.farmville);
	Jobs.RollCron.start();
	Jobs.NightlyCycleCron.start();
	Jobs.LotteryCron.start();
});

client.on("messageCreate", async (msg: Message) => {
	try {
		if (msg.author.bot) return;

		const mentions = message.getMentionedGuildMembers(msg);
		const firstMention = mentions[0];
		if (mentions.length > 0 && message.didSomeoneMentionBillyP(mentions))
			message.billyPoggersReact(msg);

		switch (true) {
			case /.*(!help).*/gmi.test(msg.content):
				Generic.Help(msg);
				break;
			case /.*(!sheesh).*/gmi.test(msg.content):
				await message.sheesh(msg);
				break;
			case /.*(!skistats).*/gmi.test(msg.content):
				skistats.all(msg);
				break;
			case /.*!bucks.*/gmi.test(msg.content):
				Currency.CheckBucks(msg, "!bucks", firstMention);
				break;
			case /.*!billypay .* [0-9]{1,}/gmi.test(msg.content):
				Currency.BillyPay(msg, "!billypay", firstMention);
				break;
			case /.*!configure.*/gmi.test(msg.content):
				Currency.Configure(client, msg);
				break;
			case /.*!allowance.*/gmi.test(msg.content):
				Currency.Allowance(msg);
				break;
			case /.*!noblemen.*/gmi.test(msg.content):
				Currency.GetNobles(msg);
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
			case /.*!joe.*/gmi.test(msg.content):
				joe.joe(msg);
				break;
			case /.*!fridayfunnies.*/gmi.test(msg.content):
				dianne.fridayFunnies(msg);
				break;
			case /.*!whereshowwie.*/gmi.test(msg.content):
				whatshowardupto.howardUpdate(msg, config.GOOGLE_API_KEY, config.GOOGLE_CX_KEY);
				break;
			case msg.channel.type !== "DM" && msg.channel.name === "admin-announcements":
				message.adminMsg(msg, client);
				break;
			case /.*good bot.*/gmi.test(msg.content):
				message.goodBot(msg);
				break;
			case /.*bad bot.*/gmi.test(msg.content):
				message.badBot(msg);
				break;
			case /.*!spin.*/gmi.test(msg.content):
				roulette.spin(msg, "!spin");
				break;
			case /.*!loan.*/gmi.test(msg.content):
				lending.getActiveLoanInfo(msg);
				break;
			case /.*!bookloan.*/gmi.test(msg.content):
				lending.bookNewLoan(msg, "!bookloan");
				break;
			case /.*!payloan.*/gmi.test(msg.content):
				lending.payActiveLoan(msg, "!payloan");
				break;
			case /.*!creditscore.*/gmi.test(msg.content):
				lending.getCreditScoreInfo(msg);
				break;
			case /.*!lotto.*/gmi.test(msg.content):
				lottery.getLotteryInfo(msg);
				break;
			case /.*!buylottoticket.*/gmi.test(msg.content):
				lottery.buyLotteryTicket(msg);
				break;
			case /.*!baseballrecord.*/gmi.test(msg.content):
				baseball.getRecord(msg, "!baseballrecord", firstMention);
				break;
			case /.*!baseball.*/gmi.test(msg.content):
				baseball.baseball(msg, "!baseball", firstMention);
				break;
			case /.*!swing.*/gmi.test(msg.content):
				baseball.swing(msg);
				break;
			case /.*!forfeit.*/gmi.test(msg.content):
				baseball.forfeit(msg);
				break;
			case /.*!cooperstown.*/gmi.test(msg.content):
				baseball.cooperstown(msg);
				break;
			case /.*!stock.*/gmi.test(msg.content):
				stocks.showPrice(msg, "!stock");
				break;
			case /.*!buystock.*/gmi.test(msg.content):
				stocks.buy(msg, "!buystock");
				break;
			case /.*!sellstock.*/gmi.test(msg.content):
				stocks.sell(msg, "!sellstock");
				break;
			case /.*!portfolio.*/gmi.test(msg.content):
				stocks.portfolio(msg);
				break;
			case /.*!disc.*/gmi.test(msg.content):
				disc.disc(msg, "!disc");
				break;
			case /.*!sheesh.*/gmi.test(msg.content):
				message.sheesh(msg);
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

client.on("messageReactionAdd", async (react, user) => {
	if (react.partial) await react.fetch();
	if (react.message.author.bot) {
		if (react.emoji.name === "🖕" && client.user.username === react.message.author.username) {
			react.message.channel.send(`<@${user.id}> 🖕`);
		}
	} else {
		switch (true) {
			case (react.emoji.name === "BillyBuck"):
				Currency.BuckReact(react as MessageReaction, user.id);
		}
	}
});

client.on("unhandledRejection", error => {
	logger.error("Unhanded promise rejection: ", error);
});

client.login(config.BOT_TOKEN).catch(e => {
	logger.error(e);
});