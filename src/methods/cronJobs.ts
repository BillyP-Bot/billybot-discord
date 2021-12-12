import { Client } from "discord.js";
import { CronJob } from "cron";

import { LoanRepository as LoanRepo } from "../repositories/LoanRepository";

export default class CronJobs {

	private static EverySecond: string = "* * * * * *";
	private static MondayNine: string = "0 0 9 * * 1";
	private static EveryNightAtMidnight: string = "0 0 0 * * *";
	private static FridayNoon: string = "0 0 12 * * 5";
	private client: Client;

	constructor(client: Client) {
		this.client = client;
	}

	public NightlyCycleCron = new CronJob(CronJobs.EveryNightAtMidnight, () => {
		CronJobs.NightlyCycle(this.client);
	}, null, null, "America/New_York");

	public static NightlyCycle(client: Client): void {
		const serverIds = client.guilds.cache.map(guild => guild.id);

		serverIds.forEach(serverId => {
			LoanRepo.NightlyCycle(serverId);
		});
	}
}