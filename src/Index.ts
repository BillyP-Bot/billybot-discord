import type { Message, MessageReaction, User } from "discord.js";
import { Client, Intents, MessageEmbed } from "discord.js";

import { config } from "./helpers/config";
import { Embed, updateEngagementMetrics } from "./helpers";
import { Images, Activities } from "./types/enums";
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
	birthdayCommand,
	handlers
} from "./commands";
import { buckReact, updateEmoteMetrics } from "./reactions";
import { Colors, Emotes } from "./types/enums";

const intents = new Intents();
intents.add(Intents.ALL);
const client = new Client({ restTimeOffset: 0 });

client.on("ready", () => {
	console.log(`Logged in as ${client.user.tag}!`);
	config.IS_PROD && client.user.setAvatar(Images.billyMad);
	config.IS_PROD && client.user.setActivity(Activities.farmville);
	client.channels.fetch("738194989917536317");
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
		if (msg.channel.id === "975795297257136189" && config.IS_PROD) return;
		if (msg.author.bot) return;
		switch (true) {
			case msg.channel.name === "admin-announcements":
				return await announcementsCommand.handler(msg);
			case /.*bing.*/gim.test(msg.content):
				return await bingCommand.handler(msg);
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
			case /.*!feature .*/gim.test(msg.content):
				return await featuresCommand.handler(msg);
			case /.*!fool .*/gim.test(msg.content):
				return await foolCommand.handler(msg);
			case /.*!p .*/gim.test(msg.content):
				return await playYoutubeCommand.handler(msg);
			case /.*!birthday.*/gim.test(msg.content):
				return await birthdayCommand.handler(msg);
			case /.*(!help).*/gim.test(msg.content):
				return await help(msg);
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
});

client.on("unhandledRejection", console.error);

client.login(config.BOT_TOKEN).catch(console.error);
