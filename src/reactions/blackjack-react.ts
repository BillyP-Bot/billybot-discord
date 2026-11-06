import { BlackjackReacts } from "btbot-types";
import type { Message } from "discord.js";

import { Api } from "@/helpers/api";
import { hitBlackjack, reactWithBlackjackMoves, standBlackjack } from "@/helpers/blackjack";
import type { BlackJackGameResponse } from "@/types";

// plays a move in the reacting user's active hand (if any), posting the result in the channel
export const blackjackReact = async (message: Message<true>, emoji: string, userId: string) => {
  const game = await Api.get<Partial<BlackJackGameResponse>>(
    `gamble/blackjack/server/${message.guildId}?user_id=${userId}`,
  );
  // the backend responds with an empty object if the user has no active hand
  if (Object.keys(game).length === 0) return;
  switch (emoji) {
    case BlackjackReacts.hit: {
      const { embed, isComplete } = await hitBlackjack(message.guildId, userId, false);
      const reply = await message.channel.send({ embeds: [embed] });
      if (!isComplete) await reactWithBlackjackMoves(reply, false);
      return;
    }
    case BlackjackReacts.stand: {
      const embed = await standBlackjack(message.guildId, userId);
      await message.channel.send({ embeds: [embed] });
      return;
    }
    case BlackjackReacts.doubleDown: {
      const { embed } = await hitBlackjack(message.guildId, userId, true);
      await message.channel.send({ embeds: [embed] });
      return;
    }
  }
};
