import axios from "axios";
import { Message } from "discord.js";

import { ICommandHandler } from "../Types";
import config from "../helpers/config";

export default {
	case: "whereshowwie",
	requiredArgs: false,
	arguments: [],
	properUsage: "!whereshowwie",
	resolver: async (msg: Message) => {
		const query = "howard+bruck+linkedin&num=1";
		const { data } = await axios.get(`https://www.googleapis.com/customsearch/v1?key=${config.GOOGLE_API_KEY}&cx=${config.GOOGLE_CX_KEY}&q=${query}`);
		const { title, snippet, link} = data.items[0];
		msg.reply(`I thought I got rid of him! Where is he?\n${title}\n${snippet}\n${link}`);
	}
} as ICommandHandler;