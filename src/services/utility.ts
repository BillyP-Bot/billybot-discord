import { Client } from "discord.js";
import { CronJob } from "cron";

import * as rockandroll from "../methods/rockandroll";

export const RockAndRoll = (client: Client): CronJob => {
	return new CronJob("0 0 9 * * 1", () => {
		rockandroll.itsTime(client);
	}, null, null, "America/New_York");
};