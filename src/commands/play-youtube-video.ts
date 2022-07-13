import YouTube from "youtube-sr";
import ytdl from "ytdl-core";

import { VideoQueue } from "../helpers";

import type { Message, VoiceConnection } from "discord.js";

import type { ICommand } from "../types";

const queue = new VideoQueue();

export const playYoutubeCommand: ICommand = {
	prefix: /.*!p .*/gim,
	command: "!p",
	description: "Play a youtube video in current voice channel. Usage: `!p [url/text]`",
	handler: async (msg: Message) => {
		const searchTerm = msg.content.split("!p ")[1];
		const [video, playlist] = await Promise.all([
			fetchFirstVideo(searchTerm),
			fetchFirstPlaylist(searchTerm)
		]);
		if (!video && !playlist) throw "no results found";
		const connection = await msg.member.voice.channel.join();

		if (!video) {
			for (const v of playlist) {
				queue.enqueue(v);
			}
		} else queue.enqueue(video);

		if (queue.length() === (video ? 1 : playlist.videoCount)) {
			await playNextVideoInQueue(msg, connection);
		} else {
			await msg.channel.send(
				`✅ Queued ${video ? "Video" : "Playlist"}:\n\`${
					video?.title || playlist.title
				}\`\n\n` + getNowPlayingAndNextUp()
			);
		}
		return;
	}
};

const fetchFirstVideo = (term: string) => {
	const isVideoUrl = isUrl(term) && !term.includes("playlist?list=");
	if (!isVideoUrl) return YouTube.searchOne(term);
	return YouTube.getVideo(term);
};

const fetchFirstPlaylist = (term: string) => {
	const isPlaylistUrl = isUrl(term) && term.includes("playlist?list=");
	if (!isPlaylistUrl) return YouTube.searchOne(term, "playlist");
	return YouTube.getPlaylist(term);
};

const isUrl = (term: string) => {
	return /^((?:https?:)?\/\/)?((?:www|m)\.)?((?:youtube(-nocookie)?\.com|youtu.be))(\/(?:[\w\\-]+\?v=|embed\/|v\/)?)([\w\\-]+)(\S+)?$/.test(
		term
	);
};

const playNextVideoInQueue = async (msg: Message, connection: VoiceConnection) => {
	try {
		const video = queue.front();
		const url = `https://www.youtube.com/watch?v=${video.id}`;
		const stream = connection.play(ytdl(url, { filter: "audioonly", highWaterMark: 1 << 25 }));
		stream.setVolume(0.2);
		await msg.channel.send(getNowPlayingAndNextUp());
		stream.on("finish", async () => {
			queue.dequeue();
			if (!queue.front())
				setTimeout(() => {
					connection.disconnect();
				}, 30000);
			else await playNextVideoInQueue(msg, connection);
		});
	} catch (error) {
		clearVideoQueue();
		throw error;
	}
};

const getNowPlayingAndNextUp = () => {
	let text = `▶️ Now Playing:\n\`${queue.front().title}\`\n\n`;
	if (queue.length() > 1) {
		text += "🎶 Next Up:\n";
		text += queue.list();
	}
	return text;
};

export const clearVideoQueue = () => {
	queue.clear();
};

export const skipCommand: ICommand = {
	prefix: /.*!skip.*/gim,
	command: "!skip",
	description: "Skip the track that is currently playing.",
	handler: async (msg: Message) => {
		if (!queue.front()) throw "No track is currently playing!";
		await msg.channel.send("⏭️ Skipping track...");
		const connection = await msg.member.voice.channel.join();
		if (queue.length() === 1) {
			(connection.player as VoiceConnection).dispatcher.end();
			return;
		}
		queue.dequeue();
		await playNextVideoInQueue(msg, connection);
		return;
	}
};

export const queueCommand: ICommand = {
	prefix: /.*!queue.*/gim,
	command: "!queue",
	description: "List the track currently playing along with the upcoming tracks in the queue.",
	handler: async (msg: Message) => {
		if (queue.length() === 0) throw "No tracks in the queue!";
		await msg.channel.send(getNowPlayingAndNextUp());
		return;
	}
};
