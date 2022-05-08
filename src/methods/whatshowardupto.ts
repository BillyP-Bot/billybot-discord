import { Message } from "discord.js";
import fetch from "node-fetch";

import { logger } from "../services/logger";

export const howardUpdate = (msg: Message, googleAPIKey: string, googleCXKey: string) => {
	fetch("https://www.googleapis.com/customsearch/v1?key=" + googleAPIKey + "&cx=" + googleCXKey + "&q=howard+bruck+linkedin&num=1")
		.then(response => response.json())
		.then(data => {
			logger.info("Successfully Queried Google");
			msg.reply("I thought I got rid of him! Where is he?\n" + data.items[0].title + "\n" + data.items[0].snippet + "\n" + data.items[0].link);
		});
};
