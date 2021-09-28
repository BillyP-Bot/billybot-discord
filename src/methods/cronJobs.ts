import { Client, TextChannel } from "discord.js";
import { CronJob } from "cron";
import path from "path";
import { cwd } from "process";

export default class CronJobs {

	private static EverySecond: string = "* * * * * *";
	private static MondayNine: string = "0 0 9 * * 1";
	private client: Client;

	constructor(client: Client) {
		this.client = client;
	}

	public RollCron = new CronJob(CronJobs.MondayNine, () => {
		CronJobs.ItsTime(this.client);
	}, null, null, "America/New_York");

	public static ItsTime(client: Client): void {
		const channels: any = client.channels.cache.filter((TextChannel: TextChannel) => TextChannel.name === "mems");
		//const attachment = new MessageAttachment('../videos/rockandroll.mp4');

		channels.forEach((channel: TextChannel) => {
			channel.send("Good Morning!", { files: [path.join(cwd(), "./videos/rockandroll.mp4")] })
				.then(() => console.log("It's time to rock and roll"))
				.catch(console.error);
		});
	}
}