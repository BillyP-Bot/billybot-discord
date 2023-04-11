import type { MessageReaction } from "discord.js";

import { Api } from "../helpers";

export async function updateEmoteMetrics(react: MessageReaction, sender_id: string) {
	try {
		const server_id = react.message.guild.id;
		const body = [
			{
				server_id,
				user_id: sender_id,
				engagement: { reactions_used: 1 }
			},
			{
				server_id,
				user_id: react.message.author.id,
				engagement: { reactions_received: 1 }
			}
		];
		return await Api.put("metrics/engagement", body);
	} catch (error) {
		console.error({ error });
	}
}
