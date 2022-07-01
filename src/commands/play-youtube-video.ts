import YouTube from "youtube-sr";
import ytdl from "ytdl-core";

import type { Message } from "discord.js";

import type { ICommand } from "../types";

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
		const url = `https://www.youtube.com/watch?v=${video.id}`;
		const channel = msg.member.voice.channel;
		const connection = await channel.join();
		const stream = connection.play(ytdl(url, { filter: "audioonly", highWaterMark: 1 << 25 }));
		stream.setVolume(0.2);
		stream.on("finish", () => {
			connection.disconnect();
		});
		return;
	}
};
