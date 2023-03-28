import type { GuildMember, Message, MessageReaction, User, VoiceState } from "discord.js";
import { ChannelType, Client, Events, GatewayIntentBits } from "discord.js";
import { DisTube } from "distube";

import {
	albumCommand,
	allowanceCommand,
	amaCommand,
	announcementsCommand,
	betCommand,
	bingCommand,
	birthdayCommand,
	birthdaysCommand,
	blackjackCommand,
	blackjackDoubleDownCommand,
	blackjackHitCommand,
	blackjackStandCommand,
	bucksCommand,
	buyStockCommand,
	buyTicketCommand,
	challengeCommand,
	closeBetCommand,
	concedeCommand,
	configureCommand,
	connectFourCommand,
	factCheckCommand,
	featuresCommand,
	foolCommand,
	handlers,
	imageCommand,
	lottoCommand,
	noblemenCommand,
	payBucksCommand,
	playYoutubeCommand,
	portfolioCommand,
	queueCommand,
	sellStockCommand,
	serfsCommand,
	sheeshCommand,
	skipCommand,
	spinCommand,
	stockCommand,
	taxesCommand
} from "./commands";
import { configureGuildUsers } from "./commands/configure";
import { clearVideoQueue } from "./commands/play-youtube-video";
import { Embed, isBlackjackReact, isConnectFourReact, updateEngagementMetrics } from "./helpers";
import { config } from "./helpers/config";
import { sendPaginatedCommandList } from "./helpers/embed";
import { blackjackReact, buckReact, connectFourReact, updateEmoteMetrics } from "./reactions";
import { Activities, Channels, Emotes, Images } from "./types/enums";

const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMembers,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.MessageContent,
		GatewayIntentBits.GuildMessageReactions,
		GatewayIntentBits.GuildVoiceStates
	]
});

const distube = new DisTube(client, { leaveOnStop: false });

client.once(Events.ClientReady, () => {
	console.log(`Logged in as ${client.user.tag}!`);
	config.IS_PROD && client.user.setAvatar(Images.billyMad);
	config.IS_PROD && client.user.setActivity(Activities.farmville);
	client.channels.fetch(Channels.bot);
});

async function help(msg: Message) {
	await sendPaginatedCommandList(handlers, msg);
}

async function messageHandler(msg: Message) {
	try {
		if (msg.channel.type === ChannelType.DM) return;
		if (msg.channel.id === Channels.botTesting && config.IS_PROD) return;
		if (msg.channel.id !== Channels.botTesting && !config.IS_PROD) return;
		if (msg.author.bot) return;
		switch (true) {
			case msg.channel.id === Channels.adminAnnouncements:
				return await announcementsCommand.handler(msg);
			case /.*!help.*/gim.test(msg.content):
				return await help(msg);
			case /.*!bing.*/gim.test(msg.content):
				return await bingCommand.handler(msg);
			case /.*!bet.*/gim.test(msg.content):
				return await betCommand.handler(msg);
			case /.*!bucks.*/gim.test(msg.content):
				return await bucksCommand.handler(msg);
			case /.*!lotto.*/gim.test(msg.content):
				return await lottoCommand.handler(msg);
			case /.*!ticket.*/gim.test(msg.content):
				return await buyTicketCommand.handler(msg);
			case /.*!pay .* [0-9]{1,}/gim.test(msg.content):
				return await payBucksCommand.handler(msg);
			case /.*!allowance.*/gim.test(msg.content):
				return await allowanceCommand.handler(msg);
			case /.*!noblemen.*/gim.test(msg.content):
				return await noblemenCommand.handler(msg);
			case /.*!serfs.*/gim.test(msg.content):
				return await serfsCommand.handler(msg);
			case /.*!spin.*/gim.test(msg.content):
				return await spinCommand.handler(msg);
			case /.*!blackjack [0-9].*/gim.test(msg.content):
				return await blackjackCommand.handler(msg);
			case /.*!hit.*/gim.test(msg.content):
				return await blackjackHitCommand.handler(msg);
			case /.*!stand.*/gim.test(msg.content):
				return await blackjackStandCommand.handler(msg);
			case /.*!doubledown.*/gim.test(msg.content):
				return await blackjackDoubleDownCommand.handler(msg);
			case /.*!taxes.*/gim.test(msg.content):
				return await taxesCommand.handler(msg);
			case /.*!configure.*/gim.test(msg.content):
				return await configureCommand.handler(msg);
			case /.*!concede .*/gim.test(msg.content):
				return await concedeCommand.handler(msg);
			case /.*!challenge.*/gim.test(msg.content):
				return await challengeCommand.handler(msg);
			case /.*!closebet.*/gim.test(msg.content):
				return await closeBetCommand.handler(msg);
			case /.*!feature .*/gim.test(msg.content):
				return await featuresCommand.handler(msg);
			case /.*!fool .*/gim.test(msg.content):
				return await foolCommand.handler(msg);
			case /.*!p .*/gim.test(msg.content):
				return await playYoutubeCommand.handler(msg, distube);
			case /.*!skip.*/gim.test(msg.content):
				return await skipCommand.handler(msg, distube);
			case /.*!queue.*/gim.test(msg.content):
				return await queueCommand.handler(msg);
			case /.*!birthdays.*/gim.test(msg.content):
				return await birthdaysCommand.handler(msg);
			case /.*!birthday.*/gim.test(msg.content):
				return await birthdayCommand.handler(msg);
			case /.*!s+h+ee+s+h+.*/gim.test(msg.content):
				return await sheeshCommand.handler(msg);
			case /.*!stock.*/gim.test(msg.content):
				return await stockCommand.handler(msg);
			case /.*!buystock.*/gim.test(msg.content):
				return await buyStockCommand.handler(msg);
			case /.*!sellstock.*/gim.test(msg.content):
				return await sellStockCommand.handler(msg);
			case /.*!portfolio.*/gim.test(msg.content):
				return await portfolioCommand.handler(msg);
			case /.*!connectfour.*/gim.test(msg.content):
				return await connectFourCommand.handler(msg);
			case /.*!image.*/gim.test(msg.content):
				return await imageCommand.handler(msg);
			case /.*!album.*/gim.test(msg.content):
				return await albumCommand.handler(msg);
			case /.*!ama.*/gim.test(msg.content):
				return await amaCommand.handler(msg);
			case /.*!factcheck.*/gim.test(msg.content):
				return await factCheckCommand.handler(msg);
			default:
				return updateEngagementMetrics(msg);
		}
	} catch (error) {
		console.log({ error });
		msg.channel.send({ embeds: [Embed.error(error)] });
	}
}

client.on(Events.MessageCreate, messageHandler);

async function reactHandler(react: MessageReaction, user: User) {
	try {
		if (react.message.author.id === user.id) return;
		if (react.message.channel.id === Channels.botTesting && config.IS_PROD) return;
		if (react.message.channel.id !== Channels.botTesting && !config.IS_PROD) return;
		await updateEmoteMetrics(react, user.id);
		if (react.message.author.id === client.user.id && react.emoji.name === "🖕") {
			return await react.message.channel.send(`<@${user.id}> 🖕`);
		}
		if (react.emoji.name === Emotes.billy_buck && !react.message.author.bot) {
			return await buckReact(react, user.id);
		}
		if (isBlackjackReact(react)) {
			return await blackjackReact(react, user.id);
		}
		if (isConnectFourReact(react)) {
			return await connectFourReact(react, user.id);
		}
	} catch (error) {
		console.log({ error });
		await react.message.channel.send({ embeds: [Embed.error(error)] });
	}
}

client.on(Events.MessageReactionAdd, reactHandler);

async function guildMemberAddHandler(member: GuildMember) {
	await configureGuildUsers(member.guild);
}

client.on(Events.GuildMemberAdd, guildMemberAddHandler);

client.on("unhandledRejection", console.error);

client.on(Events.VoiceStateUpdate, (oldState: VoiceState) => {
	// when bot leaves voice channel
	if (oldState.member.user.bot && oldState.channelId) {
		distube.removeAllListeners();
		clearVideoQueue();
	}
});

client.login(config.BOT_TOKEN).catch(console.error);
