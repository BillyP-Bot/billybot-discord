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
			if (!video) {
				msg.channel.send("No results found!");
				return;
			}
			queue.enqueue(video);
			if (queue.length() === 1) {
				playNextVideoInQueue(msg, distube);
			} else {
				msg.channel.send(
					`✅ Queued Video:\n\`${video.name}\`\n\n` + getNowPlayingAndNextUp()
				);
			}
		} catch (error) {
			console.log(error);
			if (error.errorCode === "NO_RESULT") {
				throw "No results found!";
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

export const clearVideoQueue = () => {
	queue.clear();
};

const playNextVideoInQueue = (msg: Message, distube: DisTube) => {
	const video = queue.front();
	if (!video) return exitAfterTimeoutIfNothingInQueue(msg, distube);
	msg.channel.send(getNowPlayingAndNextUp());
	distube.play(msg.member.voice.channel, video);
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
