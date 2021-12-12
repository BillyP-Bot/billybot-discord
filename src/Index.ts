/* eslint-disable indent */
import "dotenv/config";
import { Guild, Message, MessageEmbed} from "discord.js";

import config from "./helpers/config";
import logger from "./services/logger";
import CronJobs from "./methods/cronJobs";
import { Images, Activities } from "./types/Constants";
import * as message from "./methods/messages";
import * as disc from "./methods/disc";
import * as skistats from "./methods/skiStats";
import * as kyle from "./methods/kyle";
import * as lending from "./methods/lending";
import * as baseball from "./methods/baseball";
import * as stocks from "./methods/stocks";

import { readdirSync } from "fs";
import path from "path";

import { client } from "./helpers/client";
import { ICommandHandler, IPhraseHandler } from "./types";
import { BtBackend } from "./services/rest";

const commandsDir = path.join(__dirname, "./commands");
const phrasesDir = path.join(__dirname, "./phrases");
const commands: ICommandHandler[] = [];
const phrases: IPhraseHandler[] = [];

const importCommands = () => {
	const files = readdirSync(commandsDir);
	console.log(files);
	for (const file of files) {
		const handler = require(`${commandsDir}/${file}`).default as ICommandHandler;
		commands.push(handler);
	}
	console.log(`${commands.length} commands registered`);
};

const importPhrases = () => {
	const files = readdirSync(phrasesDir);
	console.log(files);
	for (const file of files) {
		const handler = require(`${phrasesDir}/${file}`).default as IPhraseHandler;
		phrases.push(handler);
	}
	console.log(`${phrases.length} phrases registered`);
};

const messageHandler = async (msg: Message) => {
	try {
		if (!msg.guild) return;
		if (msg.author.bot) return;
		if (!msg.content.startsWith("!")) return;

		const _case = msg.content.split("!")[1];
		const cmd = commands.find(a => a.case == _case?.split(" ")[0]);
		if (!cmd) return;

		const args = msg.content.split(" ").slice(1).filter(a => a !== null && a.trim() != "");
		if (cmd.requiredArgs && args.length < cmd.arguments.length)
			throw new Error(`This Command Has Required Arguments\nCommand Usage:\n${cmd.properUsage}`);

		cmd.resolver(msg, args);
	} catch (error) {
		console.log(error);
		const embed = new MessageEmbed()
			.setColor("RED")
			.addFields([
				{ name: "Error:", value: `\`\`\`${error.message}\`\`\`` || "```An Error Has Occured```" }
			])
			.setTimestamp();
		await msg.channel.send({ embeds: [embed] });
	}
};

const phraseHandler = async (msg: Message) => {
	try {
		if (!msg.guild) return;
		if (msg.author.bot) return;

		const phrase = phrases.find(a => a.case.test(msg.content));
		if (!phrase) return;

		phrase.resolver(msg);
	} catch (error) {
		console.log(error);
	}
};

const Jobs: CronJobs = new CronJobs(client);

client.on("guildCreate", (guild: Guild) => {
	const owner = guild.members.cache.find(a => a.id == guild.ownerId);
	owner.send(`Thanks for adding me to ${guild.name}!\nCommands are very simple, just type !help in your server!`);
});

client.on("ready", () => {
	logger.info(`Logged in as ${client.user.tag}!`);
	config.IS_PROD && client.user.setAvatar(Images.billyMad);
	client.user.setActivity(Activities.farmville);
	Jobs.NightlyCycleCron.start();
});

client.on("messageCreate", async (msg: Message) => {
	await messageHandler(msg);
	await phraseHandler(msg);
	// try {
	// 	if (msg.author.bot) return;

	// 	const mentions = message.getMentionedGuildMembers(msg);
	// 	const firstMention = mentions[0];
	// 	if (mentions.length > 0 && message.didSomeoneMentionBillyP(mentions))
	// 		message.billyPoggersReact(msg);

	// 	switch (true) {
	// 		case /.*(!skistats).*/gmi.test(msg.content):
	// 			skistats.all(msg);
	// 			break;
	// 		case msg.channel.type !== "DM" && msg.channel.name === "admin-announcements":
	// 			message.adminMsg(msg, client);
	// 			break;
	// 		// case /.*good bot.*/gmi.test(msg.content):
	// 		// 	message.goodBot(msg);
	// 		// 	break;
	// 		case /.*bad bot.*/gmi.test(msg.content):
	// 			message.badBot(msg);
	// 			break;
	// 		case /.*!loan.*/gmi.test(msg.content):
	// 			lending.getActiveLoanInfo(msg);
	// 			break;
	// 		case /.*!bookloan.*/gmi.test(msg.content):
	// 			lending.bookNewLoan(msg, "!bookloan");
	// 			break;
	// 		case /.*!payloan.*/gmi.test(msg.content):
	// 			lending.payActiveLoan(msg, "!payloan");
	// 			break;
	// 		case /.*!creditscore.*/gmi.test(msg.content):
	// 			lending.getCreditScoreInfo(msg);
	// 			break;
	// 		case /.*!baseballrecord.*/gmi.test(msg.content):
	// 			baseball.getRecord(msg, "!baseballrecord", firstMention);
	// 			break;
	// 		case /.*!baseball.*/gmi.test(msg.content):
	// 			baseball.baseball(msg, "!baseball", firstMention);
	// 			break;
	// 		case /.*!swing.*/gmi.test(msg.content):
	// 			baseball.swing(msg);
	// 			break;
	// 		case /.*!forfeit.*/gmi.test(msg.content):
	// 			baseball.forfeit(msg);
	// 			break;
	// 		case /.*!cooperstown.*/gmi.test(msg.content):
	// 			baseball.cooperstown(msg);
	// 			break;
	// 		case /.*!stock.*/gmi.test(msg.content):
	// 			stocks.showPrice(msg, "!stock");
	// 			break;
	// 		case /.*!buystock.*/gmi.test(msg.content):
	// 			stocks.buy(msg, "!buystock");
	// 			break;
	// 		case /.*!sellstock.*/gmi.test(msg.content):
	// 			stocks.sell(msg, "!sellstock");
	// 			break;
	// 		case /.*!portfolio.*/gmi.test(msg.content):
	// 			stocks.portfolio(msg);
	// 			break;
	// 		case /.*!disc.*/gmi.test(msg.content):
	// 			disc.disc(msg, "!disc");
	// 			break;
	// 		default:
	// 			message.includesAndResponse(msg, triggersAndResponses);
	// 			kyle.kyleNoWorking(msg);
	// 			kyle.getKyleCommand(msg);
	// 	}
	// } catch (error) {
	// 	console.log(error);
	// }
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
				BtBackend.Client.put("user/pay", {
					server: react.message.guild.id,
					amount: 1,
					payerId: user.id,
					recipientId: react.message.author.id
				});
		}
	}
});

client.on("unhandledRejection", error => {
	logger.error("Unhanded promise rejection: ", error);
});

(async () => {
	importCommands();
	importPhrases();
	await client.login(config.BOT_TOKEN);
})();