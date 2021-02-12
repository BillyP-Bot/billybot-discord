import { Client, Guild, Message } from "discord.js";

import config from "./helpers/config";
import logger from "./services/logger";

import * as Consts from "./types/Constants";
import * as Util from "./services/utility";
import * as message from "./methods/messages";
import * as boyd from "./methods/boyd";
import * as dianne from "./methods/dianne";
import * as skistats from "./methods/skiStats";
import * as whatshowardupto from "./methods/whatshowardupto";
import * as kyle from "./methods/kyle";

const client: Client = new Client();

client.on("guildCreate", (guild: Guild) => {
	guild.owner.send(`Thanks for adding me to ${guild.name}!\nCommands are very simple, just type !help in your server!`);
});

client.on("ready", () => {
	logger.info(`Logged in as ${client.user.tag}!`);
	client.user.setAvatar("https://cdn.discordapp.com/emojis/694721037006405742.png?v=1");
	client.user.setActivity("Farmville");
	Util.RockAndRoll(client).start();
});

//const kyleCommand : RegExp = /.*!drink*/gmi; TODO
//TODO Includes and responses

client.on("message", (msg: Message) => {
	if (msg.author.bot) return;

	if (Consts.adminMsg.test(msg.content)) {
		message.adminMsg(msg, client);
	} else if (Consts.skiStats.test(msg.content)) {
		skistats.all(msg);
	} else if (Consts.townRoad.test(msg.content)) {
		boyd.townRoad(msg);
	} else if (Consts.exitStream.test(msg.content)) {
		boyd.exitStream(msg);
	} else if (Consts.fridayFunny.test(msg.content)) {
		dianne.fridayFunny(msg);
	} else if (Consts.fridayFunnies.test(msg.content)) {
		dianne.fridayFunnies(msg);
	} else if (Consts.howardUpdate.test(msg.content)) {
		whatshowardupto.howardUpdate(msg, config.GOOGLE_API_KEY, config.GOOGLE_CX_KEY);
	} else {
		message.includesAndResponse(msg, Consts.triggersAndResponses);
		kyle.kyleNoWorking(msg);
		kyle.getKyleCommand(msg);
	}
});

client.on("unhandledRejection", error => {
	logger.error("Unhanded promise rejection: ", error);
});

client.login(config.BOT_TOKEN).catch(e => {
	logger.error(e);
});