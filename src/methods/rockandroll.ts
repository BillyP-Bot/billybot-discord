import { Client, TextChannel } from "discord.js";
import path from "path";
import { cwd } from "process";

export const itsTime = (client: Client): void => {
	const channel: any = client.channels.cache.find((TextChannel: TextChannel) => TextChannel.name === "mems");
	//const attachment = new MessageAttachment('../videos/rockandroll.mp4');

	channel.send("Good Morning!", { files: [path.join(cwd(), "./videos/rockandroll.mp4")] })
		.then(() => console.log("Its time to rock and roll"))
		.catch(console.error);
};