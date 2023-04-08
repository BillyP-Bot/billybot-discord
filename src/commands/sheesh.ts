import { ApplicationCommandOptionType, ChatInputCommandInteraction, Message } from "discord.js";

import { getInteractionOptionValue } from "../helpers";

import type { ICommand } from "../types";
export const sheeshCommand: ICommand = {
	prefix: /.*!s+h+ee+s+h+.*/gim,
	command: "!sheesh",
	description: "Sometimes you just need a sheeeeeeeeessshhh...",
	handler: async (msg: Message) => {
		const match = msg.content.match(/!s+h+ee+s+h+/gim)[0];
		let e = "";
		for (let i = 0; i < match.length; i++) e += "e";
		await msg.channel.send(`Shee${e}ssshhh...`);
	},
	slash: {
		name: "sheesh",
		description: "Sometimes you just need a sheeeeeeeeessshhh...",
		options: [
			{
				name: "intensity",
				description: "How intense will your sheesh be?",
				type: ApplicationCommandOptionType.Integer,
				required: false,
				choices: [
					{
						name: "wimpy",
						value: 1
					},
					{
						name: "modest",
						value: 2
					},
					{
						name: "firm",
						value: 3
					},
					{
						name: "vigorous",
						value: 4
					},
					{
						name: "⚠️ unstable ⚠️",
						value: 5
					}
				]
			}
		],
		handler: async (int: ChatInputCommandInteraction) => {
			const intensity = getInteractionOptionValue<number>("intensity", int);
			int.reply(sheesh(intensity));
		}
	}
};

const sheesh = (intensity: number) => {
	switch (intensity) {
		case 1:
			return "Sheeeeeeeesh...";
		case 2:
			return "Sheeeeeeeeeeeesssshhhh...";
		case 3:
			return "Sheeeeeeeeeeeeeeeeeessssssssshhhhhhhh...";
		case 4:
			return "Sheeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeessssssssssshhhhhh...";
		case 5:
			return (
				"SHEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEE" +
				"EEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEE" +
				"EEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEE" +
				"EEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEESSSSSSSSSSSSSSSSSSSSSSHHHHHHHHHHHHHHHHHHHHHHHHHHHH..."
			);
		default:
			return "Sheeeeeeeesh...";
	}
};
