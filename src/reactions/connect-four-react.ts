import type { IConnectFour } from "btbot-types";
import type { Message } from "discord.js";

import { Api } from "@/helpers/api";
import {
  buildMoveResponse,
  connectFourReacts,
  reactWithConnectFourMoves,
} from "@/helpers/connect-four";

// drops a piece in the reacted column if it's the reacting user's turn in their active game
export const connectFourReact = async (message: Message<true>, emoji: string, userId: string) => {
  const game = await Api.get<Partial<IConnectFour>>(
    `gamble/connectfour/server/${message.guildId}?user_id=${userId}`,
  );
  // the backend responds with an empty object if the user has no active game
  if (Object.keys(game).length === 0) return;
  if (!game.is_accepted || game.is_complete || game.to_move !== userId) return;

  const move = connectFourReacts.indexOf(emoji);
  if (move < 0) return;

  const data = await Api.post<IConnectFour>("gamble/connectfour/move", {
    server_id: message.guildId,
    user_id: userId,
    move,
  });
  const reply = await message.channel.send(buildMoveResponse(data));
  await reactWithConnectFourMoves(reply, data);
};
