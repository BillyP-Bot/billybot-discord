import YouTube from "youtube-sr";
import ytdl from "ytdl-core";

import { VideoQueue } from "../helpers";

import type { Message } from "discord.js";

import type { ICommand } from "../types";

const queue = new VideoQueue();

async function fetchFirstVideo(term: string) {
	const isUrl =
		/^((?:https?:)?\/\/)?((?:www|m)\.)?((?:youtube(-nocookie)?\.com|youtu.be))(\/(?:[\w\\-]+\?v=|embed\/|v\/)?)([\w\\-]+)(\S+)?$/.test(
			term
		);
	if (!isUrl) return YouTube.searchOne(term);
	return YouTube.getVideo(term);
}

export const playYoutubeCommand: ICommand = {
	prefix: /.*!p .*/gim,
	command: "!p",
	description: "Play a youtube video in current voice channel. Usage: `!p [url/text]`",
	handler: async (msg: Message) => {
		const searchTerm = msg.content.split("!p")[1];
		const video = await fetchFirstVideo(searchTerm);
		if (!video) throw "no results found";
		queue.enqueue(video);
		if (queue.items.length === 1) {
			await playNextVideoInQueue(msg);
		} else msg.channel.send(`Queued: ${video.title}`);
		return;
	}
};

const playNextVideoInQueue = async (msg: Message) => {
	try {
		const video = queue.next();
		const url = `https://www.youtube.com/watch?v=${video.id}`;
		const connection = await msg.member.voice.channel.join();
		const stream = connection.play(ytdl(url, { filter: "audioonly", highWaterMark: 1 << 25 }));
		stream.setVolume(0.2);
		msg.channel.send(`Now Playing: ${video.title}`);
		stream.on("finish", async () => {
			queue.dequeue();
			if (!queue.next()) connection.disconnect();
			else await playNextVideoInQueue(msg);
		});
	} catch (error) {
		clearVideoQueue();
	}
};

export const clearVideoQueue = () => {
	queue.clear();
};
