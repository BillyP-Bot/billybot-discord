import axios from "axios";
import { Message } from "discord.js";

import { ErrorMessage } from "../helpers/message";
import { ICommandHandler } from "../types";

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

export default {
	case: "fridayfunnies",
	requiredArgs: false,
	arguments: [],
	properUsage: "!fridayfunnies",
	resolver: async (msg: Message) => {
		try {
			const { data } = await (await axios.get("https://www.reddit.com/r/boomershumor/top.json?sort=top&t=week&limit=10&over_18=False")).data as IRedditMemes;
			
			const memes = data.children.reduce((acc, { data }) => {
				!data.over_18 && data.url && acc.push(data.url);
				return acc;
			}, [] as string[]);
			
			msg.reply({
				content: "Here's your Friday Funnies!\n\n",
				files: memes
			});
		} catch (error) {
			ErrorMessage(msg, error);	
		}
	}
} as ICommandHandler;