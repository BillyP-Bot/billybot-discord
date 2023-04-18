import {
	ApplicationCommandOptionType,
	ChatInputCommandInteraction,
	TextChannel,
	VoiceBasedChannel
} from "discord.js";
import { Events } from "distube";
import YouTube, { Video } from "youtube-sr";

import { CommandNames } from "@enums";
import { getInteractionOptionValue, isValidURL, Queue } from "@helpers";
import { ISlashCommand } from "@types";

import { distube } from "../";

const INACTIVITY_SEC = 60;

const queue = new Queue<Video>();

export const playYoutubeCommand: ISlashCommand = {
	name: CommandNames.p,
	description: "Play a YouTube video in the current voice channel",
	options: [
		{
			name: "search",
			description: "Video URL or text to search YouTube for (plays first result)",
			type: ApplicationCommandOptionType.String,
			required: true
		}
	],
	handler: async (int: ChatInputCommandInteraction) => {
		const searchTextOrUrl = getInteractionOptionValue<string>("search", int);
		const member = int.guild.members.cache.get(int.member.user.id);
		const voiceChannel = member.voice.channel;
		await int.reply(`Searching YouTube for \`${searchTextOrUrl}\`...`);
		await play(searchTextOrUrl, int.channel as TextChannel, voiceChannel);
	}
};

const play = async (
	searchTextOrUrl: string,
	textChannel: TextChannel,
	voiceChannel: VoiceBasedChannel
) => {
	try {
		const video = isValidURL(searchTextOrUrl)
			? await YouTube.getVideo(searchTextOrUrl)
			: await YouTube.searchOne(searchTextOrUrl);
		if (!video) throw "No results found!";
		queue.enqueue(video);
		if (queue.length() === 1) {
			await playNextVideoInQueue(textChannel, voiceChannel);
		} else {
			await textChannel.send(
				`✅ Queued Video:\n\`${video.title}\`\n\n` + getNowPlayingAndNextUp()
			);
		}
	} catch (error) {
		switch (error.errorCode) {
			case "NO_RESULT":
				throw "No results found!";
			case "INVALID_TYPE":
				throw "User must be in a voice channel!";
			default:
				throw error;
		}
	}
};

const playNextVideoInQueue = async (textChannel: TextChannel, voiceChannel: VoiceBasedChannel) => {
	const video = queue.front();
	if (!video) return exitAfterTimeoutIfNothingInQueue(voiceChannel.guild.id);
	await distube.play(voiceChannel, video.url);
	await textChannel.send(getNowPlayingAndNextUp());
	distube.removeAllListeners();
	distube.on(Events.FINISH_SONG, async () => {
		queue.dequeue();
		await playNextVideoInQueue(textChannel, voiceChannel);
	});
};

export const skipCommand: ISlashCommand = {
	name: CommandNames.skip,
	description: "Skip the track that is currently playing",
	handler: async (int: ChatInputCommandInteraction) => {
		if (!queue.front()) throw "No track is currently playing!";
		await int.reply("⏭️ Skipping track...");
		distube.seek(int.guild.id, queue.front().duration);
	}
};

export const queueCommand: ISlashCommand = {
	name: CommandNames.queue,
	description: "List the track currently playing along with the upcoming tracks in the queue",
	handler: async (int: ChatInputCommandInteraction) => {
		if (queue.length() === 0) throw "No tracks in the queue!";
		await int.reply(getNowPlayingAndNextUp());
	}
};

export const clearQueueCommand: ISlashCommand = {
	name: CommandNames.clearqueue,
	description: "Clears all tracks from the YouTube queue",
	handler: async (int: ChatInputCommandInteraction) => {
		if (queue.length() === 0) throw "No tracks in the queue!";
		clearVideoQueue();
		await int.reply("Queue cleared!");
	}
};

export const clearVideoQueue = () => {
	queue.clear();
};

const getNowPlayingAndNextUp = () => {
	let text = `▶️ Now Playing:\n\`${queue.front().title}\`\n\n`;
	if (queue.length() > 1) {
		text += "🎶 Next Up:\n";
		text += queue.list().reduce((acc, { title }, i) => {
			return acc + (i > 0 ? `**${i}.** \`${title}\`\n` : "");
		}, "");
	}
	return text;
};

const exitAfterTimeoutIfNothingInQueue = (guild_id: string) => {
	setTimeout(() => {
		if (!queue.front()) distube.voices.leave(guild_id);
	}, INACTIVITY_SEC * 1000);
};
