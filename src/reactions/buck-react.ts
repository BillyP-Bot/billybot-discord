import type { MessageReaction } from "discord.js";

import { Api } from "@helpers";

export async function buckReact(react: MessageReaction, sender_id: string) {
	try {
		await Api.post("bucks/pay", {
			server_id: react.message.guild.id,
			amount: 1,
			recipient_id: react.message.author.id,
			sender_id
		});
	} catch (error) {
		console.error({ error });
	}
}
