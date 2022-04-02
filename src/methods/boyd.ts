import { Message, StreamDispatcher, VoiceChannel, VoiceConnection } from "discord.js";
import ytdl from "ytdl-core";

import { Log } from "../services";

export class BoydMethods {

	private static boydTownRoad: StreamDispatcher = null;

	static async TownRoad(msg: Message): Promise<void> {
		if (msg.member.voice.channel) {
			const channel: VoiceChannel = msg.member.voice.channel;
			const connection: VoiceConnection = await channel.join();
			BoydMethods.boydTownRoad = connection.play(ytdl("https://www.youtube.com/watch?v=GngH-vNbDgI", {
				filter: "audioonly"
			}));
			BoydMethods.boydTownRoad.setVolume(0.2);
	
			BoydMethods.boydTownRoad.on("finish", () => {
				msg.channel.send("That's it! Hope you enjoyed!");
				connection.disconnect();
				BoydMethods.boydTownRoad = null;
			});
		} else {
			msg.reply("You need to join a voice channel first!");
		}
	}
	
	static ExitStream(msg: Message): void {
		if (BoydMethods.boydTownRoad != null) {
			Log.Info("!stop command executed");
			BoydMethods.boydTownRoad.end();
		} else {
			msg.channel.send("I'm not in a voice channel!");
		}
	}
}
