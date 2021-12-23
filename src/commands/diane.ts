import axios from "axios";
import { Message } from "discord.js";

import { ICommandHandler } from "../types";
import { ErrorMessage } from "../helpers/message";

const getRandomIntInclusive = (min: number, max: number): number => {
	min = Math.ceil(min);
	max = Math.floor(max);
	return Math.floor(Math.random() * (max - min + 1)) + min;
};

const getRandomMeme = (memes: string[]): string[] => {
	const randomInt = getRandomIntInclusive(0, memes.length);
	return memes.splice(randomInt, 1);
};

interface IRedditMemes {
	data: {
		children: {
			data: {
				url: string,
				over_18: boolean
			}
		}[]
	}
}

const cachedImages: string[] = [];
let lastFetch = new Date();

export default {
	case: "diane",
	requiredArgs: false,
	arguments: [],
	properUsage: "!diane",
	resolver: async (msg: Message) => {
		try {
			const now = new Date();
			const isStale = (Math.abs(now.getTime() - lastFetch.getTime()) / 36e5) > 24;
			
			if (cachedImages.length !== 0 && !isStale) {
				msg.reply({
					content: "I just found this great meme on my Facebook feed!\n\n",
					files: getRandomMeme(cachedImages)
				});
				return;
			}
		
			cachedImages.length = 0;
			lastFetch = new Date();

			const { data } = await (await axios.get("https://www.reddit.com/r/terriblefacebookmemes/hot.json?limit=50&over_18=boolean")).data as IRedditMemes;
		
			const memes = data.children.reduce((acc, { data }) => {
				!data.over_18 && data.url && acc.push(data.url);
				cachedImages.push(...acc);
				return acc;
			}, [] as string[]);
		
			msg.reply({
				content: "I just found this great meme on my Facebook feed!\n\n",
				files: getRandomMeme(memes)
			});
		} catch (error) {
			ErrorMessage(msg, error);
		}
	}
} as ICommandHandler;