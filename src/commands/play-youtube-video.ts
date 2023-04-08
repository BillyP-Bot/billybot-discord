import type {
	ChatInputCommandInteraction,
	Message,
	TextChannel,
	VoiceBasedChannel
} from "discord.js";
import { ApplicationCommandOptionType } from "discord.js";
import { Events } from "distube";

import { distube } from "../";
import { getInteractionOptionValue, VideoQueue } from "../helpers";
import { ICommand } from "../types";

const INACTIVITY_SEC = 60;

const queue = new VideoQueue();

export const playYoutubeCommand: ICommand = {
	prefix: /.*!p .*/gim,
	command: "!p",
	description: "Play a YouTube video in the current voice channel. Usage: `!p [url/text]`",
	handler: async (msg: Message) => {
		const searchText = msg.content.split("!p ")[1];
		await play(searchText, msg.channel as TextChannel, msg.member.voice.channel);
	},
	slash: {
		name: "p",
		description: "Play a YouTube video in the current voice channel",
		options: [
			{
				name: "search_text",
				description: "Text to search YouTube for (plays first result)",
				type: ApplicationCommandOptionType.String,
				required: true
			}
		],
		handler: async (int: ChatInputCommandInteraction) => {
			const searchText = getInteractionOptionValue<string>("search_text", int);
			const member = int.guild.members.cache.get(int.member.user.id);
			const voiceChannel = member.voice.channel;
			await play(searchText, int.channel as TextChannel, voiceChannel);
		}
	}
};

const play = async (
	searchText: string,
	textChannel: TextChannel,
	voiceChannel: VoiceBasedChannel
) => {
	try {
		const video = (await distube.search(searchText, { limit: 1 }))[0];
		if (!video) throw "No results found!";
		queue.enqueue(video);
		if (queue.length() === 1) {
			await playNextVideoInQueue(textChannel, voiceChannel);
		} else {
			textChannel.send(`✅ Queued Video:\n\`${video.name}\`\n\n` + getNowPlayingAndNextUp());
		}
	} catch (error) {
		console.log(error);
		switch (error.errorCode) {
			case "NO_RESULT":
				throw "No results found!";
			case "INVALID_TYPE":
				throw "User must be in a voice channel!";
			default:
				throw "Unexpected error occurred!";
		}
	}
};

export const skipCommand = {
	prefix: /.*!skip.*/gim,
	command: "!skip",
	description: "Skip the track that is currently playing.",
	handler: async (msg: Message) => {
		if (!queue.front()) throw "No track is currently playing!";
		msg.channel.send("⏭️ Skipping track...");
		distube.seek(msg.guildId, queue.front().duration);
	}
};

export const queueCommand = {
	prefix: /.*!queue.*/gim,
	command: "!queue",
	description: "List the track currently playing along with the upcoming tracks in the queue.",
	handler: async (msg: Message) => {
		if (queue.length() === 0) throw "No tracks in the queue!";
		msg.channel.send(getNowPlayingAndNextUp());
	}
};

export const clearQueueCommand = {
	prefix: /.*!clearqueue.*/gim,
	command: "!clearqueue",
	description: "Clears all tracks from the YouTube queue.",
	handler: async (msg: Message) => {
		if (queue.length() === 0) throw "No tracks in the queue!";
		clearVideoQueue();
		await msg.channel.send("Queue cleared!");
	}
};

export const clearVideoQueue = () => {
	queue.clear();
};

const playNextVideoInQueue = async (textChannel: TextChannel, voiceChannel: VoiceBasedChannel) => {
	const video = queue.front();
	if (!video) return exitAfterTimeoutIfNothingInQueue(voiceChannel.guild.id);
	await distube.play(voiceChannel, video);
	textChannel.send(getNowPlayingAndNextUp());
	distube.removeAllListeners();
	distube.on(Events.FINISH_SONG, () => {
		queue.dequeue();
		playNextVideoInQueue(textChannel, voiceChannel);
	});
};

const getNowPlayingAndNextUp = () => {
	let text = `▶️ Now Playing:\n\`${queue.front().name}\`\n\n`;
	if (queue.length() > 1) {
		text += "🎶 Next Up:\n";
		text += queue.list();
	}
	return text;
};

const exitAfterTimeoutIfNothingInQueue = (guild_id: string) => {
	setTimeout(() => {
		if (!queue.front()) distube.voices.leave(guild_id);
	}, INACTIVITY_SEC * 1000);
};
