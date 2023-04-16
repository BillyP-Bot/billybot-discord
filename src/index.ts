import type { MessageReaction } from "discord.js";
import { ChannelType, Client, Events, GatewayIntentBits } from "discord.js";
import { DisTube } from "distube";

import { commandsLookup } from "./commands";
import { configureGuildUsers } from "./commands/configure";
import { postFeature } from "./commands/feature-request";
import { clearVideoQueue } from "./commands/play-youtube-video";
import {
	config,
	Embed,
	isBlackjackReact,
	isConnectFourReact,
	postAdminAnnouncement,
	registerSlashCommands,
	sendLegacyCommandDeprecationNotice,
	updateEngagementMetrics
} from "./helpers";
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

export const distube = new DisTube(client, { leaveOnStop: false });

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
				return await updateEngagementMetrics(msg);
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
		await updateEmoteMetrics(react, user.id);
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

client.on(Events.VoiceStateUpdate, (oldState) => {
	try {
		// when bot leaves voice channel
		if (oldState.member.user.bot && oldState.channelId) {
			distube.removeAllListeners();
			clearVideoQueue();
		}
	} catch (error) {
		console.error({ error });
	}
});

process.on("unhandledRejection", (error) => {
	console.error({ error });
});

client.login(config.BOT_TOKEN).catch((error) => {
	console.error({ error });
});
