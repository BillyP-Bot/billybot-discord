import type { GuildMember, Message, MessageReaction, User, VoiceState } from "discord.js";
import { ChannelType, Client, Events, GatewayIntentBits } from "discord.js";
import { DisTube } from "distube";

import { announcementsCommand, commandsLookup } from "./commands";
import { configureGuildUsers } from "./commands/configure";
import { clearVideoQueue } from "./commands/play-youtube-video";
import { Embed, isBlackjackReact, isConnectFourReact, updateEngagementMetrics } from "./helpers";
import { config } from "./helpers/config";
import { registerSlashCommands } from "./helpers/slash";
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
	await registerSlashCommands(client);
	if (config.IS_PROD) {
		await client.user.setAvatar(Images.billyMad);
		client.user.setActivity(Activities.farmville);
	}
	await client.channels.fetch(Channels.bot);
	console.log(`Logged in as ${client.user.tag}!`);
});

client.on(Events.MessageCreate, async (msg: Message) => {
	try {
		if (msg.channel.type === ChannelType.DM) return;
		if (msg.channel.id === Channels.botTesting && config.IS_PROD) return;
		if (msg.channel.id !== Channels.botTesting && !config.IS_PROD) return;
		if (msg.author.bot) return;
		switch (true) {
			case msg.channel.id === Channels.adminAnnouncements:
				return await announcementsCommand.handler(msg);
			default:
				return await updateEngagementMetrics(msg);
		}
	} catch (error) {
		console.log({ error });
		msg.channel.send({ embeds: [Embed.error(error)] });
	}
});

client.on(Events.MessageReactionAdd, async (react: MessageReaction, user: User) => {
	try {
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
			return await react.message.channel.send(`<@${user.id}> 🖕`);
		}
		if (react.emoji.name === Emotes.billy_buck && !react.message.author.bot) {
			return await buckReact(react, user.id);
		}
	} catch (error) {
		console.log({ error });
		await react.message.channel.send({ embeds: [Embed.error(error)] });
	}
});

client.on(Events.GuildMemberAdd, async (member: GuildMember) => {
	await configureGuildUsers(member);
});

client.on(Events.VoiceStateUpdate, (oldState: VoiceState) => {
	// when bot leaves voice channel
	if (oldState.member.user.bot && oldState.channelId) {
		distube.removeAllListeners();
		clearVideoQueue();
	}
});

client.on(Events.InteractionCreate, async (int) => {
	try {
		if (!int.isChatInputCommand()) return;
		if (int.channel.id === Channels.botTesting && config.IS_PROD) return;
		if (int.channel.id !== Channels.botTesting && !config.IS_PROD) return;
		const command = commandsLookup[int.commandName];
		if (command) await command.handler(int);
	} catch (error) {
		console.log({ error });
		if (int.isRepliable()) {
			if (int.replied) await int.editReply({ embeds: [Embed.error(error)] });
			else await int.reply({ embeds: [Embed.error(error)] });
		}
	}
});

client.on("unhandledRejection", console.error);

client.login(config.BOT_TOKEN).catch(console.error);
