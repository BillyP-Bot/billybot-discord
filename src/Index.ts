/* eslint-disable no-unused-vars */
/* eslint-disable indent */
import "dotenv/config";
import { Client, Guild, GuildMember, Intents, Message, MessageEmbed, MessageReaction, TextChannel, User } from "discord.js";
import YouTube from "youtube-sr";
import ytdl from "ytdl-core";

import { config } from "./helpers/config";
import { logger } from "./services/logger";
import { Images, Activities } from "./types/Constants";
import { Api } from "./services/rest";

const intents: Intents = new Intents();
intents.add(Intents.ALL);
const client: Client = new Client({ restTimeOffset: 0 });

client.on("guildCreate", (guild: Guild) => {
	guild.owner.send(`Thanks for adding me to ${guild.name}!\nCommands are very simple, just type !help in your server!`);
});
client.on("ready", () => {
	logger.info(`Logged in as ${client.user.tag}!`);
	config.IS_PROD && client.user.setAvatar(Images.billyMad);
	config.IS_PROD && client.user.setActivity(Activities.farmville);
	client.channels.fetch("738194989917536317");
});

enum Roles {
	developer = "BillyPBotDev",
	mayor = "Mayor of Boy Town"
}
enum Emotes {
	billy_buck = "BillyBuck"
}
enum Colors {
	red = "#ff6666",
	green = "#00e64d"
}
interface IUser {
	_id: string
	billy_bucks: number
	server_id: string
	user_id: string
	username: string
	discriminator: string
	avatar_hash?: string
	last_allowance: Date
	has_lottery_ticket: boolean
	metrics: {
		posts: number
		reactions_used: number
		reactions_received: number
		average_reactions_per_post: number
		mentions: number
	}
	created_at: Date
	updated_at: Date
}
type ApiError = {
	status?: number
	ok?: boolean
	error?: string
	[key: string]: any
}
type UserLookup = Record<string, IUser>
type ApiResponse = ApiError & UserLookup

class Embed {

	static success(msg: Message, description: string, title?: string) {
		const embed = new MessageEmbed();
		embed.setColor(Colors.green).setTitle(title);
		embed.setDescription(description);
		return embed;
	}

	static error(msg: Message, description: string, title?: string) {
		const embed = new MessageEmbed();
		embed.setColor(Colors.red).setTitle(title ?? "Error");
		embed.setDescription(description);
		return embed;
	}
}

async function assertDeveloper(msg: Message) {
	await msg.member.fetch();
	const devRole = msg.member.roles.cache.find(a => a.name == Roles.developer);
	if (!devRole) throw "unauthorized";
}

async function assertMayor(msg: Message) {
	await msg.member.fetch();
	const mayorRole = msg.member.roles.cache.find(a => a.name == Roles.mayor);
	if (!mayorRole) throw "only the mayor can run this command!";
	return mayorRole;
}

async function configureUsers(msg: Message) {
	await assertDeveloper(msg);
	await msg.guild.fetch();
	const users = msg.guild.members.cache.reduce((acc, { user }) => {
		if (user.bot) return acc;
		acc.push({
			server_id: msg.guild.id,
			user_id: user.id,
			username: user.username,
			discriminator: user.discriminator,
			avatar_hash: user.avatar
		});
		return acc;
	}, [] as Partial<IUser>[]);

	const { data, ok } = await Api.client.post<ApiError & IUser[]>("users", users);
	if (!ok) throw data.error ?? "internal server error";
	msg.channel.send(`${data.length} user(s) configured`);
}

async function allowance(msg: Message) {
	const { data, ok } = await Api.client.post<ApiResponse>("bucks/allowance", {
		server_id: msg.guild.id,
		user_id: msg.author.id
	});
	if (!ok) throw data.error ?? "internal server error";
	const user = data[msg.author.id] as IUser;
	const embed = Embed.success(msg, `Here's your allowance, ${user.username}! You now have ${user.billy_bucks} BillyBucks!`, "+ 200");
	msg.channel.send(embed);
}

async function bucks(msg: Message) {
	const { data, ok } = await Api.client.get<ApiError & IUser>(`users?user_id=${msg.author.id}&server_id=${msg.guild.id}`);
	if (!ok) throw data.error ?? "internal server error";
	const user = data;
	const embed = Embed.success(msg, `You have ${user.billy_bucks} BillyBucks!`, user.username);
	msg.channel.send(embed);
}

async function noblemen(msg: Message) {
	const { data, ok } = await Api.client.get<ApiError & IUser[]>(`bucks/noblemen/${msg.guild.id}`);
	if (!ok) throw data.error ?? "internal server error";
	const users = data;
	const embed = new MessageEmbed();
	embed.setColor(Colors.green);
	embed.setDescription(`Here Are The ${users.length} Richest Members`);
	users.map((user, i) => embed.addField(`${i + 1}. ${user.username}`, `$${user.billy_bucks}`));
	msg.channel.send(embed);
}

async function serfs(msg: Message) {
	const { data, ok } = await Api.client.get<ApiError & IUser[]>(`bucks/serfs/${msg.guild.id}`);
	if (!ok) throw data.error ?? "internal server error";
	const users = data;
	const embed = new MessageEmbed();
	embed.setColor(Colors.green);
	embed.setDescription(`Here Are The ${users.length} Poorest Members`);
	users.map((user, i) => embed.addField(`${i + 1}. ${user.username}`, `$${user.billy_bucks}`));
	msg.channel.send(embed);
}

async function lotteryInfo(msg: Message) {
	const { data, ok } = await Api.client.get<ApiError & {
		ticket_cost: number,
		jackpot: number,
		entrants: IUser[],
		base_lottery_jackpot: number,
		entrants_count: number
	}>(`lottery/${msg.guild.id}`);
	if (!ok) throw data.error ?? "internal server error";
	if (data.entrants.length <= 0) {
		const embed = Embed.success(msg, "No entrants yet!", "Weekly Lottery");
		msg.channel.send(embed);
		return;
	}

	let body = `A winner will be picked on Friday at noon! Buy a ticket today for ${data.ticket_cost} BillyBucks!\n\n`;
	body += `Ticket Cost: ${data.ticket_cost}\n`;
	body += `Base Lottery Jackpot: ${data.base_lottery_jackpot}\n`;
	body += `Current Jackpot: ${data.jackpot}\n`;
	body += `Entrants: ${data.entrants_count}\n\n`;
	data.entrants.map(({ username }) => body += username + "\n");
	const embed = Embed.success(msg, body, "Weekly Lottery");
	msg.channel.send(embed);
}

async function buyLotteryTicket(msg: Message) {
	const { data, ok } = await Api.client.post<ApiResponse & { ticket_cost: number }>("lottery", {
		server_id: msg.guild.id,
		user_id: msg.author.id
	});
	if (!ok) throw data.error ?? "internal server error";
	const user = data[msg.author.id] as IUser;
	let body = `You bought a lottery ticket for ${data.ticket_cost} BillyBucks!\n\n`;
	body += `You now have ${user.billy_bucks} BillyBUcks, a winner will be picked on Friday at noon!`;
	const embed = Embed.success(msg, body, "Lottery Ticket Purchased");
	msg.channel.send(embed);
}

async function payBucks(msg: Message, prefix: string, mention: GuildMember) {
	const username = msg.content.substring(prefix.length, msg.content.lastIndexOf(" ")).trim();
	const amount = msg.content.substring(msg.content.lastIndexOf(" ")).trim();

	if (typeof parseInt(amount) !== "number") throw "amount must be a number";
	if (!username || !mention) return;
	if (username === msg.author.username || (mention && mention.user.username === msg.author.username)) {
		throw `You cannot pay yourself, ${username}!`;
	}
	const found = mention ? mention : msg.guild.members.cache.find(a => a.user.username.toUpperCase() === username.toUpperCase().trim());
	if (!found) throw `Could not find ${username} in this server.`;

	const { data, ok } = await Api.client.post<ApiResponse>("bucks/pay", {
		server_id: msg.guild.id,
		amount: parseInt(amount),
		recipient_id: found.id,
		sender_id: msg.author.id
	});
	if (!ok) throw data.error ?? "internal server error";
	const recipient = data[found.id] as IUser;
	const embed = Embed.success(msg, `You paid ${recipient.username} ${amount} BillyBucks!`, recipient.username);
	msg.channel.send(embed);
}

async function makeMayor(msg: Message, mention: GuildMember) {
	const mayorRole = await assertMayor(msg);
	const author = await msg.guild.members.fetch(msg.author.id);
	if (mention.user.id === author.user.id) throw "you are already the mayor!";
	const server_id = msg.guild.id;
	const body = [
		{
			server_id,
			user_id: mention.user.id,
			is_mayor: true
		},
		{
			server_id,
			user_id: author.user.id,
			is_mayor: false
		},
	];
	const { data, ok } = await Api.client.put<ApiResponse>("users", body);
	if (!ok) throw data.error ?? "internal server error";
	// TODO might have to check access for editing roles
	// mention.roles.add(mayorRole);
	// author.roles.remove(mayorRole);
	const embed = Embed.success(msg, `${mention.user.username} is now the mayor!`, "Mayoral Decree!");
	msg.channel.send(embed);
}

async function fetchFirstVideo(term: string) {
	const isUrl = /^((?:https?:)?\/\/)?((?:www|m)\.)?((?:youtube(-nocookie)?\.com|youtu.be))(\/(?:[\w\\-]+\?v=|embed\/|v\/)?)([\w\\-]+)(\S+)?$/.test(term);
	if (!isUrl) return YouTube.searchOne(term);
	return YouTube.getVideo(term);
}

async function playYoutubeAudio(msg: Message) {
	const searchTerm = msg.content.split("!p")[1];
	const video = await fetchFirstVideo(searchTerm);
	if (!video) throw "no results found";
	const url = `https://www.youtube.com/watch?v=${video.id}`;
	const channel = msg.member.voice.channel;
	const connection = await channel.join();
	const stream = connection.play(ytdl(url, { filter: "audioonly" }));
	stream.setVolume(0.2);
	stream.on("finish", () => {
		connection.disconnect();
	});
}

async function adminAnnouncement(msg: Message, client: Client) {
	await assertDeveloper(msg);
	await msg.guild.fetch();
	const general = client.channels.cache.find((channel: TextChannel) => channel.name === "general") as TextChannel;
	if (!general) throw "channel not found";
	// post webhook announcement
	const { data, ok } = await Api.client.post<ApiResponse>("announcements", {
		server_id: msg.guild.id,
		user_id: msg.author.id,
		text: msg.content,
		channel_name: general.name
	});
	console.log({ data });
	if (!ok) throw data.error ?? "internal server error";
}

async function spinRoulette(msg: Message, prefix: string) {
	const args = msg.content.slice(prefix.length).trim().split(" ");
	const bet = parseInt(args[0]);
	const color = args[1];
	const { data, ok } = await Api.client.post<ApiResponse & {
		user: IUser,
		outcome: {
			won: boolean
			payout: number
			winning_color: string
		}
	}>("gamble/roulette/spin", {
		server_id: msg.guild.id,
		user_id: msg.author.id,
		color,
		amount: bet
	});
	if (!ok) throw data.error ?? "internal server error";
	const { user, outcome } = data;
	if (!outcome.won) {
		const embed = Embed.error(
			msg,
			`It's ${outcome.winning_color}! You lose your bet of ${bet} BillyBucks! You're a DEAD MAAANNN!\n You now have ${user.billy_bucks} BillyBucks.`,
			"You Lost!"
		);
		return msg.channel.send(embed);
	}
	const embed = Embed.success(
		msg,
		`It's ${outcome.winning_color}! You win ${outcome.payout} BillyBucks! Lady LUUUCCCCKKK!\n You now have ${user.billy_bucks} BillyBucks.`,
		"You Won!"
	);
	return msg.channel.send(embed);
}

async function buckReact(react: MessageReaction, sender_id: string) {
	return Api.client.post<ApiResponse>("bucks/pay", {
		server_id: react.message.guild.id,
		amount: 1,
		recipient_id: react.message.author.id,
		sender_id
	});
}

async function updatePostEngagement(msg: Message) {
	const server_id = msg.guild.id;
	const body = [
		{
			server_id,
			user_id: msg.author.id,
			engagement: { posts: 1 }
		}
	];
	return Api.client.put<ApiResponse>("metrics/engagement", body);
}

async function updateMentionsMetric(msg: Message, mentions: GuildMember[]) {
	const server_id = msg.guild.id;
	if (mentions.length <= 0) return;
	const operations = mentions.reduce((acc, { user }) => {
		if (user.bot) return acc;
		if (user.id === msg.author.id) return acc;
		acc.push({
			server_id,
			user_id: user.id,
			engagement: { mentions: 1 }
		});
		return acc;
	}, []);
	return Api.client.put<ApiResponse>("metrics/engagement", operations);
}

async function updateEmoteMetrics(react: MessageReaction, sender_id: string) {
	const server_id = react.message.guild.id;
	const body = [
		{
			server_id,
			user_id: sender_id,
			engagement: { reactions_used: 1 }
		},
		{
			server_id,
			user_id: react.message.author.id,
			engagement: { reactions_received: 1 }
		}
	];
	return Api.client.put<ApiResponse>("metrics/engagement", body);
}

client.on("message", async (msg: Message) => {
	try {
		if (msg.channel.type === "dm") return;
		if (msg.author.bot) return;
		const mentions = msg.mentions.members.array();
		updatePostEngagement(msg);
		updateMentionsMetric(msg, mentions);
		const firstMention = mentions[0];
		switch (true) {
			case /.*!bucks.*/gmi.test(msg.content):
				return await bucks(msg);
			case /.*!lotto.*/gmi.test(msg.content):
				return await lotteryInfo(msg);
			case /.*!buylottoticket.*/gmi.test(msg.content):
				return await buyLotteryTicket(msg);
			case /.*!billypay .* [0-9]{1,}/gmi.test(msg.content):
				return await payBucks(msg, "!billypay", firstMention);
			case /.*!makeMayor .*/gmi.test(msg.content):
				return await makeMayor(msg, firstMention);
			case /.*!configure.*/gmi.test(msg.content):
				return await configureUsers(msg);
			case /.*!allowance.*/gmi.test(msg.content):
				return await allowance(msg);
			case /.*!noblemen.*/gmi.test(msg.content):
				return await noblemen(msg);
			case /.*!serfs.*/gmi.test(msg.content):
				return await serfs(msg);
			case /.*!p.*/gmi.test(msg.content):
				return await playYoutubeAudio(msg);
			case /.*!spin.*/gmi.test(msg.content):
				return await spinRoulette(msg, "!spin");
			case msg.channel.name === "admin-announcements":
				return await adminAnnouncement(msg, client);
			case /.*bing.*/gmi.test(msg.content):
				return msg.reply("bong");
			default:
				return;
		}
	} catch (error) {
		console.log({ error });
		msg.channel.send(Embed.error(msg, error));
	}
});

client.on("messageReactionAdd", (react: MessageReaction, user: User) => {
	if (react.message.author.id === user.id) return;
	updateEmoteMetrics(react, user.id);
	if (react.message.author.id === client.user.id && react.emoji.name === "🖕") {
		return react.message.channel.send(`<@${user.id}> 🖕`);
	}
	if (react.emoji.name === Emotes.billy_buck) {
		return buckReact(react, user.id);
	}
});


// client.on("message", async (msg: Message) => {
// 	try {
// 		if (msg.author.bot) return;
// 		// const firstMention = mentions[0];
// 		// if (mentions.length > 0 && message.didSomeoneMentionBillyP(mentions))
// 		// 	message.billyPoggersReact(msg);

// 		switch (true) {
// 			// case /.*(!help).*/gmi.test(msg.content):
// 			// 	Generic.Help(msg);
// 			// 	break;
// 			// case /.*(!sheesh).*/gmi.test(msg.content):
// 			// 	await message.sheesh(msg);
// 			// 	break;
// 			// case /.*(!skistats).*/gmi.test(msg.content):
// 			// 	skistats.all(msg);
// 			// 	break;
// 			case /.*!bucks.*/gmi.test(msg.content):
// 				await bucks(msg);
// 				break;
// 			// case /.*!billypay .* [0-9]{1,}/gmi.test(msg.content):
// 			// 	Currency.BillyPay(msg, "!billypay", firstMention);
// 			// 	break;
// 			case /.*!configure.*/gmi.test(msg.content):
// 				await configureUsers(msg);
// 				break;
// 			case /.*!allowance.*/gmi.test(msg.content):
// 				await allowance(msg);
// 				break;
// 			case /.*!noblemen.*/gmi.test(msg.content):
// 				await noblemen(msg);
// 				break;
// 			// case /.*!boydTownRoad.*/gmi.test(msg.content):
// 			// 	boyd.townRoad(msg);
// 			// 	break;
// 			// case /.*!stop.*/gmi.test(msg.content):
// 			// 	boyd.exitStream(msg);
// 			// 	break;
// 			// case /.*!diane.*/gmi.test(msg.content):
// 			// 	dianne.fridayFunny(msg);
// 			// 	break;
// 			// case /.*!joe.*/gmi.test(msg.content):
// 			// 	joe.joe(msg);
// 			// 	break;
// 			// case /.*!fridayfunnies.*/gmi.test(msg.content):
// 			// 	dianne.fridayFunnies(msg);
// 			// 	break;
// 			// case /.*!whereshowwie.*/gmi.test(msg.content):
// 			// 	whatshowardupto.howardUpdate(msg, config.GOOGLE_API_KEY, config.GOOGLE_CX_KEY);
// 			// 	break;
// 			// case msg.channel.type !== "dm" && msg.channel.name === "admin-announcements":
// 			// 	await message.adminMsg(msg, client);
// 			// 	break;
// 			// case /.*good bot.*/gmi.test(msg.content):
// 			// 	message.goodBot(msg);
// 			// 	break;
// 			// case /.*bad bot.*/gmi.test(msg.content):
// 			// 	message.badBot(msg);
// 			// 	break;
// 			// case /.*!spin.*/gmi.test(msg.content):
// 			// 	roulette.spin(msg, "!spin");
// 			// 	break;
// 			// case /.*!loan.*/gmi.test(msg.content):
// 			// 	lending.getActiveLoanInfo(msg);
// 			// 	break;
// 			// case /.*!bookloan.*/gmi.test(msg.content):
// 			// 	lending.bookNewLoan(msg, "!bookloan");
// 			// 	break;
// 			// case /.*!payloan.*/gmi.test(msg.content):
// 			// 	lending.payActiveLoan(msg, "!payloan");
// 			// 	break;
// 			// case /.*!creditscore.*/gmi.test(msg.content):
// 			// 	lending.getCreditScoreInfo(msg);
// 			// 	break;
// 			case /.*!lotto.*/gmi.test(msg.content):
// 				await lotteryInfo(msg);
// 				break;
// 			case /.*!buylottoticket.*/gmi.test(msg.content):
// 				await buyLotteryTicket(msg);
// 				break;
// 			// case /.*!baseballrecord.*/gmi.test(msg.content):
// 			// 	baseball.getRecord(msg, "!baseballrecord", firstMention);
// 			// 	break;
// 			// case /.*!baseball.*/gmi.test(msg.content):
// 			// 	baseball.baseball(msg, "!baseball", firstMention);
// 			// 	break;
// 			// case /.*!swing.*/gmi.test(msg.content):
// 			// 	baseball.swing(msg);
// 			// 	break;
// 			// case /.*!forfeit.*/gmi.test(msg.content):
// 			// 	baseball.forfeit(msg);
// 			// 	break;
// 			// case /.*!cooperstown.*/gmi.test(msg.content):
// 			// 	baseball.cooperstown(msg);
// 			// 	break;
// 			// case /.*!stock.*/gmi.test(msg.content):
// 			// 	stocks.showPrice(msg, "!stock");
// 			// 	break;
// 			// case /.*!buystock.*/gmi.test(msg.content):
// 			// 	stocks.buy(msg, "!buystock");
// 			// 	break;
// 			// case /.*!sellstock.*/gmi.test(msg.content):
// 			// 	stocks.sell(msg, "!sellstock");
// 			// 	break;
// 			// case /.*!portfolio.*/gmi.test(msg.content):
// 			// 	stocks.portfolio(msg);
// 			// 	break;
// 			// case /.*!disc.*/gmi.test(msg.content):
// 			// 	disc.disc(msg, "!disc");
// 			// 	break;
// 			// case /.*!sheesh.*/gmi.test(msg.content):
// 			// 	message.sheesh(msg);
// 			// 	break;
// 			// case /.*!blackjack.*/gmi.test(msg.content):
// 			// 	blackjack.blackjack(msg, "!blackjack");
// 			// 	break;
// 			// case /.*!hit.*/gmi.test(msg.content):
// 			// 	blackjack.hit(msg.author.id, msg.guild.id, msg.channel);
// 			// 	break;
// 			// case (/.*!stand.*/gmi.test(msg.content) || /.*!stay.*/gmi.test(msg.content)):
// 			// 	blackjack.stand(msg.author.id, msg.guild.id, msg.channel);
// 			// 	break;
// 			// case /.*!doubledown.*/gmi.test(msg.content):
// 			// 	blackjack.doubleDown(msg.author.id, msg.guild.id, msg.channel);
// 			// 	break;
// 			// default:
// 			// 	message.includesAndResponse(msg, triggersAndResponses);
// 			// 	kyle.kyleNoWorking(msg);
// 			// 	kyle.getKyleCommand(msg);
// 		}
// 	} catch (error) {
// 		console.log(error);
// 		msg.channel.send(Embed.error(msg, error));
// 	}
// });

client.on("unhandledRejection", error => {
	logger.error("Unhanded promise rejection: ", error);
});

client.login(config.BOT_TOKEN).catch(logger.error);
