/* eslint-disable indent */
import { join, extname } from "path";
import { readdirSync } from "fs";
import { Guild, Message } from "discord.js";

import { config } from "./helpers/config";
import logger from "./services/logger";
import { Images, Activities } from "./types/Constants";
import { client } from "./helpers/client";
import { IAdminCommandHandler, ICommandHandler, IPhraseHandler } from "./types";
import { BtBackend } from "./services/rest";
import { ErrorMessage } from "./helpers/message";

const commands: ICommandHandler[] = [];
const phrases: IPhraseHandler[] = [];
const adminCommands: IAdminCommandHandler[] = [];

const importCommands = <T>(filesDir: string, commands: Array<T>) => {
	const files = readdirSync(filesDir);
	const valid = files.filter(a => extname(a) === (config.IS_COMPILED ? ".js": ".ts"));
	console.log(valid);
	for (const file of valid) {
		const handler = require(`${filesDir}/${file}`).default as T;
		commands.push(handler);
	}
	console.log(`${commands.length} commands registered`);
};
const messageHandler = async (msg: Message) => {
	try {
		if (!msg.guild) return;
		if (msg.author.bot) return;
		if (!/.*!.*/.test(msg.content)) return;

		const _case = msg.content.split("!")[1];
		const cmd = commands.find(a => a.case == _case?.split(" ")[0]);
		if (!cmd) return;

		const args = msg.content.split(" ").slice(1).filter(a => a !== null && a.trim() != "");
		if (cmd.requiredArgs && args.length < cmd.arguments.length)
			throw new Error(`This Command Has Required Arguments\nCommand Usage:\n${cmd.properUsage}`);

		cmd.resolver(msg, args);
	} catch (error: any) {
		ErrorMessage(msg, error);
	}
};
const phraseHandler = async (msg: Message) => {
	try {
		if (!msg.guild) return;
		if (msg.author.bot) return;

		const filtered = phrases.filter(a => a.case(msg));
		if (!filtered) return;

		const resolvers = filtered.reduce((acc, phrase) => {
			acc.push(phrase.resolver(msg));
			return acc;
		}, [] as Promise<void>[]);

		await Promise.all(resolvers);
	} catch (error) {
		console.log(error);
	}
};
const adminCommandHandler = async (msg: Message) => {
	try {
		if (!msg.guild) return;
		if (msg.author.bot) return;
		const devRole = msg?.member?.roles.cache.find(a => a.name == "BillyPBotDev");
		if (!devRole) throw new Error("user permission denied");

		const command = adminCommands.find(a => a.case(msg) === true);
		if (!command) return;

		command.resolver(msg);
	} catch (error) {
		console.log(error);
	}
};

client.on("guildCreate", (guild: Guild) => {
	const owner = guild.members.cache.find(a => a.id == guild.ownerId);
	owner?.send(`Thanks for adding me to ${guild.name}!\nCommands are very simple, just type !help in your server!`);
});

client.on("ready", async () => {
	logger.info(`Logged in as ${client?.user?.tag}!`);
	config.IS_PROD && client?.user?.setAvatar(Images.billyMad);
	client?.user?.setActivity(Activities.farmville);
});

client.on("messageCreate", async (msg: Message) => {
	try {
		messageHandler(msg);
		phraseHandler(msg);
		adminCommandHandler(msg);
	} catch (error) {
		console.log(error);
	}
});

client.on("messageReactionAdd", async (react, user) => {
	if (react.partial) await react.fetch();
	if (react?.message?.author?.bot) {
		if (react.emoji.name === "🖕" && client?.user?.username === react.message.author.username) {
			react.message.channel.send(`<@${user.id}> 🖕`);
		}
	} else {
		switch (true) {
			case (react.emoji.name === "BillyBuck"):
				BtBackend.Client.put("user/pay", {
					server: react?.message?.guild?.id,
					amount: 1,
					payerId: user.id,
					recipientId: react?.message?.author?.id
				});
		}
	}
});

client.on("unhandledRejection", error => {
	logger.error("Unhanded promise rejection: ", error);
});

(async () => {
	importCommands<ICommandHandler>(join(__dirname, "./commands"), commands);
	importCommands<IPhraseHandler>(join(__dirname, "./phrases"), phrases);
	importCommands<IAdminCommandHandler>(join(__dirname, "./adminCommands"), adminCommands);
	await client.login(config.BOT_TOKEN);
})();