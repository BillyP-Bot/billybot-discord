import { DisTube, Events } from "distube";

import { VideoQueue } from "../helpers";

import type { Message } from "discord.js";

const INACTIVITY_SEC = 60;

const queue = new VideoQueue();

export const playYoutubeCommand = {
	prefix: /.*!p .*/gim,
	command: "!p",
	description: "Play a YouTube video in current voice channel. Usage: `!p [url/text]`",
	handler: async (msg: Message, distube: DisTube) => {
		try {
			const searchTerm = msg.content.split("!p ")[1];
			const video = (await distube.search(searchTerm, { limit: 1 }))[0];
			if (!video) throw "No results found!";
			queue.enqueue(video);
			if (queue.length() === 1) {
				await playNextVideoInQueue(msg, distube);
			} else {
				msg.channel.send(
					`✅ Queued Video:\n\`${video.name}\`\n\n` + getNowPlayingAndNextUp()
				);
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
	}
};

export const skipCommand = {
	prefix: /.*!skip.*/gim,
	command: "!skip",
	description: "Skip the track that is currently playing.",
	handler: async (msg: Message, distube: DisTube) => {
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

const playNextVideoInQueue = async (msg: Message, distube: DisTube) => {
	const video = queue.front();
	if (!video) return exitAfterTimeoutIfNothingInQueue(msg, distube);
	await distube.play(msg.member.voice.channel, video);
	msg.channel.send(getNowPlayingAndNextUp());
	distube.removeAllListeners();
	distube.on(Events.FINISH_SONG, () => {
		queue.dequeue();
		playNextVideoInQueue(msg, distube);
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

const exitAfterTimeoutIfNothingInQueue = (msg: Message, distube: DisTube) => {
	setTimeout(() => {
		if (!queue.front()) distube.voices.leave(msg.guildId);
	}, INACTIVITY_SEC * 1000);
};
