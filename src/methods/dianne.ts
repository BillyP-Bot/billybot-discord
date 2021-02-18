import { Message } from "discord.js";
import fetch from "node-fetch";

import logger from "../services/logger";

// Meme API: https://github.com/R3l3ntl3ss/Meme_Api
let cachedImages: any = [];

export const fridayFunny = (msg: Message): void => {
	if (cachedImages.length == 0) {
		fetch("https://www.reddit.com/r/terriblefacebookmemes/hot.json?limit=50&over_18=False")
			.then(response => response.json())
			.then(data => {
				data.data.children.forEach((redditPost: any) => {
					if (redditPost.data.selftext == "" && redditPost.data.over_18 == false) {
						cachedImages.push(redditPost.data.url);
					}
				});
				logger.info("Populated cachedImages. Length: " + cachedImages.length);
				let fridayFunny = [];
				fridayFunny.push(getRandomMeme(cachedImages));
				logger.info(fridayFunny[0]);
				msg.reply("I just found this great meme on my Facebook feed!\n\n", {
					files: fridayFunny[0]
				});
			});
	} else {
		logger.info("cachedImages contains content: Length: " + cachedImages.length);
		let fridayFunny: any[] = [];
		fridayFunny.push(getRandomMeme(cachedImages));
		logger.info(fridayFunny[0]);
		msg.reply("I just found this great meme on my Facebook feed!\n\n", {
			files: fridayFunny[0]
		});
	}
};

export const fridayFunnies = (msg: Message): void => {

	let fridayFunnies: any = [];
	let attachmentCount: number = 0;
	fetch("https://www.reddit.com/r/boomershumor/top.json?sort=top&t=week&limit=12&over_18=False")
		.then(response => response.json())
		.then(data => {
			data.data.children.forEach((redditPost: any) => {
				if (redditPost.data.over_18 == false && attachmentCount < 10) {
					fridayFunnies.push(redditPost.data.url);
					attachmentCount += 1;
				}
			});

			msg.reply("Here's your Friday Funnies!\n\n", {
				files: fridayFunnies
			});
		});
};

export const getRandomIntInclusive = (min: number, max: number): number => {
	min = Math.ceil(min);
	max = Math.floor(max);
	return Math.floor(Math.random() * (max - min + 1)) + min;
};

const getRandomMeme = (memes: any): any => {
	let randomInt = getRandomIntInclusive(0, memes.length);
	let meme = memes.splice(randomInt, 1);
	return meme;
};
