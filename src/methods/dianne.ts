import { Message } from "discord.js";
import fetch from "node-fetch";

import { boomerHumor, facebookMemes } from "../types/Constants";

let cachedImages: any = [];
let funnies: any[] = [];

export const fridayFunny = (msg: Message): void => {

	if (cachedImages.length != 0) {
		funnies.push(getRandomMeme(cachedImages));
		msg.reply("I just found this great meme on my Facebook feed!\n\n", {
			files: funnies[0]
		});
		return;
	}

	fetch(facebookMemes).then(r => r.json()).then(data => {
		data.data.children.forEach((post: any) => {
			if (post.data.selftext == "" && post.data.over_18 == false) {
				cachedImages.push(post.data.url);
			}
		});

		funnies.push(getRandomMeme(cachedImages));
		msg.reply("I just found this great meme on my Facebook feed!\n\n", {
			files: funnies[0]
		});
	});
};

export const fridayFunnies = (msg: Message): void => {
	let attachmentCount: number = 0;

	fetch(boomerHumor).then(res => res.json()).then(data => {
		data.data.children.forEach((post: any) => {
			if (post.data.over_18 == false && attachmentCount < 10) {
				funnies.push(post.data.url);
				attachmentCount += 1;
			}
		});

		msg.reply("Here's your Friday Funnies!\n\n", {
			files: funnies
		});
	});

};

export const getRandomIntInclusive = (min: number, max: number): number => {
	min = Math.ceil(min);
	max = Math.floor(max);
	return Math.floor(Math.random() * (max - min + 1)) + min;
};

const getRandomMeme = (memes: any): any => {
	const randomInt: number = getRandomIntInclusive(0, memes.length);
	return memes.splice(randomInt, 1);
};
