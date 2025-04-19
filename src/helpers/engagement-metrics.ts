import type { Message, MessageReaction } from "discord.js";

import { Api } from "@helpers";

export const updateMessageEngagementMetrics = async (msg: Message) => {
	try {
		const server_id = msg.guild.id;
		const mentions = msg.mentions.members;
		const operations =
			mentions.size >= 1 &&
			mentions.reduce((acc, { user }) => {
				if (user.bot) return acc;
				if (user.id === msg.author.id) return acc;
				acc.push({
					server_id,
					user_id: user.id,
					engagement: { mentions: 1 }
				});
				return acc;
			}, []);
		const body = [
			{
				server_id,
				user_id: msg.author.id,
				engagement: { posts: 1 }
			},
			...(operations ? operations : [])
		];
		await Api.put("metrics/engagement", body);
	} catch (error) {
		console.error({ error });
	}
};

export const updateReactionEngagementMetrics = async (
	react: MessageReaction,
	sender_id: string
) => {
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
		await Api.put("metrics/engagement", body);
	} catch (error) {
		console.error({ error });
	}
};
