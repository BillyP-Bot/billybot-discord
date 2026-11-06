import type { Message } from "discord.js";

import { Api } from "@/helpers/api";

type EngagementUpdate = {
  server_id: string;
  user_id: string;
  engagement: {
    posts?: number;
    mentions?: number;
    reactions_used?: number;
    reactions_received?: number;
  };
};

// metrics are best-effort, so failures aren't shown to users. they're always unexpected, though
// (no user action can make this request fail), so they're logged
const updateEngagementMetrics = async (updates: EngagementUpdate[]) => {
  try {
    await Api.put("metrics/engagement", updates);
  } catch (error) {
    console.error("Failed to update engagement metrics:", error);
  }
};

// counts a post for the author, and a mention for each (non-bot) user they mentioned
export const updateMessageEngagementMetrics = async (message: Message<true>) => {
  const server_id = message.guildId;
  const mentioned = message.mentions.members.filter(
    ({ user }) => !user.bot && user.id !== message.author.id,
  );
  await updateEngagementMetrics([
    { server_id, user_id: message.author.id, engagement: { posts: 1 } },
    ...mentioned.map(({ user }) => ({ server_id, user_id: user.id, engagement: { mentions: 1 } })),
  ]);
};

export const updateReactionEngagementMetrics = async (message: Message<true>, senderId: string) => {
  const server_id = message.guildId;
  await updateEngagementMetrics([
    { server_id, user_id: senderId, engagement: { reactions_used: 1 } },
    { server_id, user_id: message.author.id, engagement: { reactions_received: 1 } },
  ]);
};
