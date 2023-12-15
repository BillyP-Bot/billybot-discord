import { ChannelType, Client, Events, GatewayIntentBits, MessageReaction } from "discord.js";

import { commandsLookup, configureGuildUsers, postFeature } from "@commands";
import { Activities, Channels, Emotes, Images } from "@enums";
import {
	config,
	Embed,
	isBlackjackReact,
	isConnectFourReact,
	isDealOrNoDealReact,
	postAdminAnnouncement,
	registerSlashCommands,
	sendLegacyCommandDeprecationNotice,
	updateMessageEngagementMetrics,
	updateReactionEngagementMetrics
} from "@helpers";
import { blackjackReact, buckReact, connectFourReact, dealOrNoDealReact } from "@reactions";

process.on("unhandledRejection", (error) => {
	console.error({ error });
});

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

client.once(Events.ClientReady, async () => {
	try {
		await registerSlashCommands(client);
		if (config.IS_PROD) {
			await client.user.setAvatar(Images.billyMad);
			client.user.setActivity(Activities.farmville);
		}
		console.log(`Logged in as ${client.user.tag}!`);
	} catch (error) {
		console.error({ error });
	}
});

client.on(Events.InteractionCreate, async (int) => {
	try {
		if (int.channel.id === Channels.botTesting && config.IS_PROD) return;
		if (int.channel.id !== Channels.botTesting && !config.IS_PROD) return;
		if (int.isChatInputCommand()) {
			const command = commandsLookup[int.commandName];
			if (command) return await command.handler(int);
			else throw "Command not supported yet! Check back soon.";
		}
		if (int.isModalSubmit()) {
			if (int.customId === "featureModal") return await postFeature(int);
		}
	} catch (error) {
		console.error({ error });
		if (!int.isRepliable()) return;
		const embed = { embeds: [Embed.error(error)] };
		if (int.deferred || int.replied) await int.editReply(embed);
		else await int.reply(embed);
	}
});

client.on(Events.MessageCreate, async (msg) => {
	try {
		if (msg.channel.type === ChannelType.DM) return;
		if (msg.channel.id === Channels.botTesting && config.IS_PROD) return;
		if (msg.channel.id !== Channels.botTesting && !config.IS_PROD) return;
		if (msg.author.bot) return;
		switch (true) {
			case msg.channel.id === Channels.adminAnnouncements:
				return await postAdminAnnouncement(msg);
			case msg.content[0] === "!":
				return await sendLegacyCommandDeprecationNotice(msg);
			default:
				return await updateMessageEngagementMetrics(msg);
		}
	} catch (error) {
		console.error({ error });
		await msg.channel.send({ embeds: [Embed.error(error)] });
	}
});

client.on(Events.MessageReactionAdd, async (msgReact, user) => {
	try {
		const react = msgReact as MessageReaction;
		if (react.message.author.id === user.id) return;
		if (react.message.channel.id === Channels.botTesting && config.IS_PROD) return;
		if (react.message.channel.id !== Channels.botTesting && !config.IS_PROD) return;
		if (isBlackjackReact(react)) {
			return await blackjackReact(react, user.id);
		}
		if (isConnectFourReact(react)) {
			return await connectFourReact(react, user.id);
		}
		if (isDealOrNoDealReact(react)) {
			return await dealOrNoDealReact(react, user.id);
		}
		await updateReactionEngagementMetrics(react, user.id);
		if (react.message.author.id === client.user.id && react.emoji.name === "🖕") {
			await react.message.channel.send(`<@${user.id}> 🖕`);
			return;
		}
		if (react.emoji.name === Emotes.billy_buck && !react.message.author.bot) {
			return await buckReact(react, user.id);
		}
	} catch (error) {
		console.error({ error });
		await msgReact.message.channel.send({ embeds: [Embed.error(error)] });
	}
});

client.on(Events.GuildMemberAdd, async (member) => {
	try {
		await configureGuildUsers(member);
	} catch (error) {
		console.error({ error });
	}
});

client.login(config.BOT_TOKEN).catch((error) => {
	console.error({ error });
});
