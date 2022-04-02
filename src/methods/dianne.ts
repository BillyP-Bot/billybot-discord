import { Message } from "discord.js";
import fetch from "node-fetch";

import { Log } from "../services";

export class DianneMethods {

	// Meme API: https://github.com/R3l3ntl3ss/Meme_Api
	static cachedImages: any = [];

	static FridayFunny(msg: Message): void {
		if (DianneMethods.cachedImages.length == 0) {
			fetch("https://www.reddit.com/r/terriblefacebookmemes/hot.json?limit=50&over_18=False")
				.then(response => response.json())
				.then(data => {
					data.data.children.forEach((redditPost: any) => {
						if (redditPost.data.selftext == "" && redditPost.data.over_18 == false) {
							DianneMethods.cachedImages.push(redditPost.data.url);
						}
					});
					Log.Info("Populated cachedImages. Length: " + DianneMethods.cachedImages.length);
					const fridayFunny = [];
					fridayFunny.push(DianneMethods.GetRandomMeme(DianneMethods.cachedImages));
					Log.Info(fridayFunny[0]);
					msg.reply("I just found this great meme on my Facebook feed!\n\n", {
						files: fridayFunny[0]
					});
				});
		} else {
			Log.Info("cachedImages contains content: Length: " + DianneMethods.cachedImages.length);
			const fridayFunny: any[] = [];
			fridayFunny.push(DianneMethods.GetRandomMeme(DianneMethods.cachedImages));
			Log.Info(fridayFunny[0]);
			msg.reply("I just found this great meme on my Facebook feed!\n\n", {
				files: fridayFunny[0]
			});
		}
	}
	
	static FridayFunnies(msg: Message): void {
	
		const fridayFunnies: any = [];
		let attachmentCount = 0;
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
	}
	
	static GetRandomIntInclusive(min: number, max: number): number {
		min = Math.ceil(min);
		max = Math.floor(max);
		return Math.floor(Math.random() * (max - min + 1)) + min;
	}
	
	private static GetRandomMeme(memes: any): any {
		const randomInt = DianneMethods.GetRandomIntInclusive(0, memes.length);
		const meme = memes.splice(randomInt, 1);
		return meme;
	}
}
