import { Client, TextChannel } from "discord.js";
import { CronJob } from "cron";
import path from "path";
import { cwd } from "process";

export default class CronJobs {

	private static EverySecond: string = "* * * * * *";
	private static MondayNine: string = "0 0 9 * * 1";
	private static EveryNightAt1AM: string = "0 0 1 * * *";
	private client: Client;

	constructor(client: Client) {
		this.client = client;
	}

	public RollCron = new CronJob(CronJobs.MondayNine, () => {
		CronJobs.ItsTime(this.client);
	}, null, null, "America/New_York");

	public NightlyCycleCron = new CronJob(CronJobs.EveryNightAt1AM, () => {
		CronJobs.NightlyCycle();
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

	// check for loans with past due payments or accrued interest
	public static NightlyCycle(): void {
		/*
		query loan table for all active loans (closedInd === false)
		for each loan:
			if loan payment is past due (current date > nextPaymentDueDate):
				- calculate penalty amount and add it to penaltyAmt and outstandingBalanceAmt fields
				- decrement user's credit score
				- bump nextPaymentDueDate out 7 days
			if it is an interest accrual date (current date >= nextInterestAccrualDate):
				- calculate interest accrual amount and add it to interestAccruedAmt and outstandingBalanceAmt fields
				- bump nextInterestAccrualDate out 7 days
		*/
	}
}