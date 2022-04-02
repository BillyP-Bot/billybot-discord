import pEvent from "p-event";
import { Client, Guild, Message, MessageReaction, User } from "discord.js";

import {Log} from "./Log";
import { Config } from "../helpers";
import { Images, Activities } from "../types";

import {
	BaseballMethods,
	BlackjackMethods,
	BoydMethods,
	CronJobs,
	Currency,
	DianneMethods,
	DiscMethods,
	Generic,
	HowardMethods,
	JoeMethods,
	KyleMethods,
	LendingMethods,
	LotteryMethods,
	MessagesMethods,
	RouletteMethods, 
	SkiStatsMethods,
	StocksMethods
} from "../methods";

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
	
			const mentions = MessagesMethods.GetMentionedGuildMembers(msg);
			const firstMention = mentions[0];
			if (mentions.length > 0 && MessagesMethods.DidSomeoneMentionBillyP(mentions))
				MessagesMethods.BillyPoggersReact(msg);
	
			switch (true) {
				case /.*(!help).*/gmi.test(msg.content):
					Generic.Help(msg);
					break;
				case /.*(!sheesh).*/gmi.test(msg.content):
					await MessagesMethods.Sheesh(msg);
					break;
				case /.*(!skistats).*/gmi.test(msg.content):
					SkiStatsMethods.All(msg);
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
					BoydMethods.TownRoad(msg);
					break;
				case /.*!stop.*/gmi.test(msg.content):
					BoydMethods.ExitStream(msg);
					break;
				case /.*!diane.*/gmi.test(msg.content):
					DianneMethods.FridayFunny(msg);
					break;
				case /.*!joe.*/gmi.test(msg.content):
					JoeMethods.Joe(msg);
					break;
				case /.*!fridayfunnies.*/gmi.test(msg.content):
					DianneMethods.FridayFunnies(msg);
					break;
				case /.*!whereshowwie.*/gmi.test(msg.content):
					HowardMethods.HowardUpdate(msg, Config.GOOGLE_API_KEY, Config.GOOGLE_CX_KEY);
					break;
				case msg.channel.type !== "dm" && msg.channel.name === "admin-announcements":
					await MessagesMethods.AdminMsg(msg, Bot.Client);
					break;
				case /.*good bot.*/gmi.test(msg.content):
					MessagesMethods.GoodBot(msg);
					break;
				case /.*bad bot.*/gmi.test(msg.content):
					MessagesMethods.BadBot(msg);
					break;
				case /.*!spin.*/gmi.test(msg.content):
					RouletteMethods.Spin(msg, "!spin");
					break;
				case /.*!loan.*/gmi.test(msg.content):
					LendingMethods.GetActiveLoanInfo(msg);
					break;
				case /.*!bookloan.*/gmi.test(msg.content):
					LendingMethods.BookNewLoan(msg, "!bookloan");
					break;
				case /.*!payloan.*/gmi.test(msg.content):
					LendingMethods.PayActiveLoan(msg, "!payloan");
					break;
				case /.*!creditscore.*/gmi.test(msg.content):
					LendingMethods.GetCreditScoreInfo(msg);
					break;
				case /.*!lotto.*/gmi.test(msg.content):
					LotteryMethods.GetLotteryInfo(msg);
					break;
				case /.*!buylottoticket.*/gmi.test(msg.content):
					LotteryMethods.BuyLotteryTicket(msg);
					break;
				case /.*!baseballrecord.*/gmi.test(msg.content):
					BaseballMethods.GetRecord(msg, "!baseballrecord", firstMention);
					break;
				case /.*!baseball.*/gmi.test(msg.content):
					BaseballMethods.Baseball(msg, "!baseball", firstMention);
					break;
				case /.*!swing.*/gmi.test(msg.content):
					BaseballMethods.Swing(msg);
					break;
				case /.*!forfeit.*/gmi.test(msg.content):
					BaseballMethods.Forfeit(msg);
					break;
				case /.*!cooperstown.*/gmi.test(msg.content):
					BaseballMethods.Cooperstown(msg);
					break;
				case /.*!stock.*/gmi.test(msg.content):
					StocksMethods.ShowPrice(msg, "!stock");
					break;
				case /.*!buystock.*/gmi.test(msg.content):
					StocksMethods.Buy(msg, "!buystock");
					break;
				case /.*!sellstock.*/gmi.test(msg.content):
					StocksMethods.Sell(msg, "!sellstock");
					break;
				case /.*!portfolio.*/gmi.test(msg.content):
					StocksMethods.Portfolio(msg);
					break;
				case /.*!disc.*/gmi.test(msg.content):
					DiscMethods.Disc(msg, "!disc");
					break;
				case /.*!sheesh.*/gmi.test(msg.content):
					MessagesMethods.Sheesh(msg);
					break;
				case /.*!blackjack.*/gmi.test(msg.content):
					BlackjackMethods.Blackjack(msg, "!blackjack");
					break;
				case /.*!hit.*/gmi.test(msg.content):
					BlackjackMethods.Hit(msg.author.id, msg.guild.id, msg.channel);
					break;
				case (/.*!stand.*/gmi.test(msg.content) || /.*!stay.*/gmi.test(msg.content)):
					BlackjackMethods.Stand(msg.author.id, msg.guild.id, msg.channel);
					break;
				case /.*!doubledown.*/gmi.test(msg.content):
					BlackjackMethods.DoubleDown(msg.author.id, msg.guild.id, msg.channel);
					break;
				default:
					MessagesMethods.IncludesAndResponse(msg, Bot.TriggersAndResponses);
					KyleMethods.KyleNoWorking(msg);
					KyleMethods.GetKyleCommand(msg);
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
	
				if (!user.bot) BlackjackMethods.OnMessageReact(react, user.id);
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
