import pEvent from "p-event";
import { Client, Guild, Message, MessageReaction, User } from "discord.js";

import {Log} from "./Log";
import { Config } from "../helpers";
import { Images, Activities } from "../types";

import CronJobs from "../methods/cronJobs";
import Currency from "../methods/currency";
import Generic from "../methods/generic";
import * as message from "../methods/messages";
import * as boyd from "../methods/boyd";
import * as dianne from "../methods/dianne";
import * as disc from "../methods/disc";
import * as skistats from "../methods/skiStats";
import * as whatshowardupto from "../methods/whatshowardupto";
import * as kyle from "../methods/kyle";
import * as joe from "../methods/joe";
import * as roulette from "../methods/roulette";
import * as lending from "../methods/lending";
import * as lottery from "../methods/lottery";
import * as baseball from "../methods/baseball";
import * as stocks from "../methods/stocks";
import * as blackjack from "../methods/blackjack";

export class Bot {
	
	private static Client: Client;
	private static Jobs: CronJobs;

	private static readonly TriggersAndResponses: string[][] = [
		["!loop", "no !loop please"],
		["vendor", "Don't blame the vendor!"],
		["linear", "We have to work exponentially, not linearly!"]
	];

	public static async Setup() {
		Bot.Client = new  Client({ restTimeOffset: 0 });
		Bot.Jobs = new CronJobs(Bot.Client);

		Bot.Client.on("guildCreate", Bot.GuildCreateHandler);
		
		
		Bot.Client.on("message", Bot.MessageHandler);
		
		Bot.Client.on("messageReactionAdd", Bot.ReactionHandler);
		
		Bot.Client.on("unhandledRejection", error => {
			Log.Error("Unhanded promise rejection: ", error);
		});

		Bot.Client.on("error", error => {
			Log.Error("Unhanded error: ", error);
		});

		Bot.Client.on("warn", message => {
			Log.Warn(message);
		});

		// setup promise for when client is ready
		const ready = pEvent(Bot.Client, "ready");

		await Bot.Client.login(Config.BOT_TOKEN);

		await ready;

		if (!Bot.Client.user)
			throw "Error logging into Discord.";

		Config.IS_PROD && Bot.Client.user.setAvatar(Images.billyMad);
		Config.IS_PROD && Bot.Client.user.setActivity(Activities.farmville);
		Bot.Jobs.RollCron.start();
		Bot.Jobs.NightlyCycleCron.start();
		Bot.Jobs.LotteryCron.start();
		
		Log.Info(`Logged in as ${Bot.Client.user.tag}!`);
	}

	static async Close(): Promise<void> {
		Bot.Client.destroy();
		Log.Info("[Discord Bot] Closed client.");
	}

	private static GuildCreateHandler(guild: Guild) {
		guild.owner.send(`Thanks for adding me to ${guild.name}!\nCommands are very simple, just type !help in your server!`);
	}

	private static async MessageHandler(msg: Message) {
		try {
			if(msg.author.bot) return;
	
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
					Currency.Configure(Bot.Client, msg);
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
					whatshowardupto.howardUpdate(msg, Config.GOOGLE_API_KEY, Config.GOOGLE_CX_KEY);
					break;
				case msg.channel.type !== "dm" && msg.channel.name === "admin-announcements":
					await message.adminMsg(msg, Bot.Client);
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
				case /.*!blackjack.*/gmi.test(msg.content):
					blackjack.blackjack(msg, "!blackjack");
					break;
				case /.*!hit.*/gmi.test(msg.content):
					blackjack.hit(msg.author.id, msg.guild.id, msg.channel);
					break;
				case (/.*!stand.*/gmi.test(msg.content) || /.*!stay.*/gmi.test(msg.content)):
					blackjack.stand(msg.author.id, msg.guild.id, msg.channel);
					break;
				case /.*!doubledown.*/gmi.test(msg.content):
					blackjack.doubleDown(msg.author.id, msg.guild.id, msg.channel);
					break;
				default:
					message.includesAndResponse(msg, Bot.TriggersAndResponses);
					kyle.kyleNoWorking(msg);
					kyle.getKyleCommand(msg);
			}
		} catch (error) {
			console.log(error);
		}
	}

	private static ReactionHandler(react: MessageReaction, user: User) {
		try {
			if (react.message.author.bot) {
				if (react.emoji.name === "🖕" && Bot.Client.user.username === react.message.author.username) {
					react.message.channel.send(`<@${user.id}> 🖕`);
				}
	
				if (!user.bot) blackjack.onMessageReact(react, user.id);
			} else {
				switch (true){
					case (react.emoji.name === "BillyBuck"):
						Currency.BuckReact(react, user.id);
				}
			}
		} catch (error) {
			Log.Error(error);
		}
	}
}
