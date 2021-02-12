import { Message, StreamDispatcher, VoiceChannel, VoiceConnection } from "discord.js";
import ytdl from "ytdl-core";

import logger from "../services/logger";
import { boydTown } from "../types/Constants";

export let boydTownRoad: StreamDispatcher = null;

export const townRoad = async (msg: Message): Promise<void> => {

	if (!msg.member.voice.channel) {
		msg.reply("You need to join a voice channel first!");
		return;
	}

	const channel: VoiceChannel = msg.member.voice.channel;
	const connection: VoiceConnection = await channel.join();

	boydTownRoad = connection.play(ytdl(boydTown, {
		filter: "audioonly"
	}));

	boydTownRoad.setVolume(0.2);

	boydTownRoad.on("finish", () => {
		msg.channel.send("That's it! Hope you enjoyed!");
		connection.disconnect();
		boydTownRoad = null;
	});
};

export const exitStream = (msg: Message): void => {
	if (boydTownRoad != null) {
		logger.info("!stop command executed");
		boydTownRoad.end();
	} else {
		msg.channel.send("I'm not in a voice channel!");
	}
};
