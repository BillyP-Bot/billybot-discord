import type { Message, MessageReaction, User } from "discord.js";
import { Client, Intents, MessageEmbed } from "discord.js";

import { config } from "./helpers/config";
import { Embed, isBlackjackReact, updateEngagementMetrics } from "./helpers";
import { Images, Activities, Channels } from "./types/enums";
import {
	bingCommand,
	bucksCommand,
	lottoCommand,
	buyTicketCommand,
	payBucksCommand,
	allowanceCommand,
	noblemenCommand,
	serfsCommand,
	spinCommand,
	blackjackCommand,
	blackjackHitCommand,
	blackjackStandCommand,
	blackjackDoubleDownCommand,
	taxesCommand,
	configureCommand,
	concedeCommand,
	featuresCommand,
	foolCommand,
	playYoutubeCommand,
	announcementsCommand,
	stockCommand,
	buyStockCommand,
	sellStockCommand,
	portfolioCommand,
	birthdayCommand,
	sheeshCommand,
	handlers
} from "./commands";
import { buckReact, blackjackReact, updateEmoteMetrics } from "./reactions";
import { Colors, Emotes } from "./types/enums";

const intents = new Intents();
intents.add(Intents.ALL);
const client = new Client({ restTimeOffset: 0 });

client.on("ready", () => {
	console.log(`Logged in as ${client.user.tag}!`);
	config.IS_PROD && client.user.setAvatar(Images.billyMad);
	config.IS_PROD && client.user.setActivity(Activities.farmville);
	client.channels.fetch(Channels.bot);
});

async function help(msg: Message) {
	const embed = new MessageEmbed();
	embed.setColor(Colors.green).setTitle("Commands");
	embed.setDescription("Here is a list of my commands!");
	embed.addField("!help", "Shows a list of my commands.");
	handlers.map(({ command, description }) => {
		if (!command) return;
		embed.addField(command, description);
	});
	msg.channel.send(embed);
	return;
}

async function messageHandler(msg: Message) {
	try {
		if (msg.channel.type === "dm") return;
		if (msg.channel.id === Channels.botTesting && config.IS_PROD) return;
		if (msg.channel.id !== Channels.botTesting && !config.IS_PROD) return;
		if (msg.author.bot) return;
		switch (true) {
			case msg.channel.id === Channels.adminAnnouncements:
				return await announcementsCommand.handler(msg);
			case /.*!help.*/gim.test(msg.content):
				return await help(msg);
			case bingCommand.prefix.test(msg.content):
				return await bingCommand.handler(msg);
			case bucksCommand.prefix.test(msg.content):
				return await bucksCommand.handler(msg);
			case lottoCommand.prefix.test(msg.content):
				return await lottoCommand.handler(msg);
			case buyTicketCommand.prefix.test(msg.content):
				return await buyTicketCommand.handler(msg);
			case payBucksCommand.prefix.test(msg.content):
				return await payBucksCommand.handler(msg);
			case allowanceCommand.prefix.test(msg.content):
				return await allowanceCommand.handler(msg);
			case noblemenCommand.prefix.test(msg.content):
				return await noblemenCommand.handler(msg);
			case serfsCommand.prefix.test(msg.content):
				return await serfsCommand.handler(msg);
			case spinCommand.prefix.test(msg.content):
				return await spinCommand.handler(msg);
			case blackjackCommand.prefix.test(msg.content):
				return await blackjackCommand.handler(msg);
			case blackjackHitCommand.prefix.test(msg.content):
				return await blackjackHitCommand.handler(msg);
			case blackjackStandCommand.prefix.test(msg.content):
				return await blackjackStandCommand.handler(msg);
			case blackjackDoubleDownCommand.prefix.test(msg.content):
				return await blackjackDoubleDownCommand.handler(msg);
			case taxesCommand.prefix.test(msg.content):
				return await taxesCommand.handler(msg);
			case configureCommand.prefix.test(msg.content):
				return await configureCommand.handler(msg);
			case concedeCommand.prefix.test(msg.content):
				return await concedeCommand.handler(msg);
			case featuresCommand.prefix.test(msg.content):
				return await featuresCommand.handler(msg);
			case foolCommand.prefix.test(msg.content):
				return await foolCommand.handler(msg);
			case playYoutubeCommand.prefix.test(msg.content):
				return await playYoutubeCommand.handler(msg);
			case birthdayCommand.prefix.test(msg.content):
				return await birthdayCommand.handler(msg);
			case sheeshCommand.prefix.test(msg.content):
				return await sheeshCommand.handler(msg);
			case stockCommand.prefix.test(msg.content):
				return await stockCommand.handler(msg);
			case buyStockCommand.prefix.test(msg.content):
				return await buyStockCommand.handler(msg);
			case sellStockCommand.prefix.test(msg.content):
				return await sellStockCommand.handler(msg);
			case portfolioCommand.prefix.test(msg.content):
				return await portfolioCommand.handler(msg);
			default:
				return updateEngagementMetrics(msg);
		}
	} catch (error) {
		console.log({ error });
		msg.channel.send(Embed.error(msg, error));
	}
}

client.on("message", messageHandler);

client.on("messageReactionAdd", (react: MessageReaction, user: User) => {
	if (react.message.author.id === user.id) return;
	updateEmoteMetrics(react, user.id);
	if (react.message.author.id === client.user.id && react.emoji.name === "🖕") {
		return react.message.channel.send(`<@${user.id}> 🖕`);
	}
	if (react.emoji.name === Emotes.billy_buck) {
		return buckReact(react, user.id);
	}
	if (isBlackjackReact(react)) {
		return blackjackReact(react, user.id);
	}
});

client.on("unhandledRejection", console.error);

client.login(config.BOT_TOKEN).catch(console.error);
