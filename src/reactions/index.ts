import type { Message, MessageReaction } from "discord.js";

import { blackjackReacts } from "@/helpers/blackjack";
import { connectFourReacts } from "@/helpers/connect-four";
import { dealOrNoDealReacts } from "@/helpers/deal-or-no-deal";
import { updateReactionEngagementMetrics } from "@/helpers/engagement-metrics";
import { blackjackReact } from "@/reactions/blackjack-react";
import { buckReact } from "@/reactions/buck-react";
import { connectFourReact } from "@/reactions/connect-four-react";
import { dealOrNoDealReact } from "@/reactions/deal-or-no-deal-react";
import { Emotes } from "@/types/enums";

export const handleReaction = async (
  reaction: MessageReaction,
  message: Message<true>,
  userId: string,
) => {
  const emoji = reaction.emoji.toString();

  // game moves are only made by reacting to the bot's own (game) messages
  if (message.author.id === message.client.user.id) {
    if (blackjackReacts.includes(emoji)) return blackjackReact(message, emoji, userId);
    if (connectFourReacts.includes(emoji)) return connectFourReact(message, emoji, userId);
    if (dealOrNoDealReacts.includes(emoji)) return dealOrNoDealReact(message, emoji, userId);
  }

  await updateReactionEngagementMetrics(message, userId);
  if (reaction.emoji.name === Emotes.billy_buck && !message.author.bot) {
    await buckReact(message, userId);
  }
};
