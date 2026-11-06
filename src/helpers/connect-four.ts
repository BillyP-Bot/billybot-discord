import { ConnectFourColor, ConnectFourReacts, type IConnectFour } from "btbot-types";
import { type Message, userMention } from "discord.js";

import { mentionCommand } from "@/helpers/command";
import { pluralIfNotOne } from "@/helpers/util";
import { CommandNames } from "@/types/enums";

// one reaction per board column, in order
export const connectFourReacts: string[] = [
  ConnectFourReacts.one,
  ConnectFourReacts.two,
  ConnectFourReacts.three,
  ConnectFourReacts.four,
  ConnectFourReacts.five,
  ConnectFourReacts.six,
  ConnectFourReacts.seven,
];

const buildChallengeResponse = (data: IConnectFour) => {
  const { red_user_id, yellow_user_id, wager } = data;
  return `${userMention(red_user_id)} has challenged ${userMention(yellow_user_id)} to a game of Connect Four${
    wager > 0 ? ` for ${wager} BillyBuck${pluralIfNotOne(wager)}` : ""
  }!\n\n${userMention(yellow_user_id)}: Run ${mentionCommand(
    CommandNames.connectfour,
  )} to accept the challenge!`;
};

export const buildMoveResponse = (data: IConnectFour) => {
  const { board, red_user_id, yellow_user_id, to_move, is_complete, wager } = data;
  let message = `${connectFourReacts.join("")}\n\n`;
  for (let i = 5; i >= 0; i--) {
    for (let j = 0; j < 7; j++) {
      const pos = board[j]?.[i];
      message +=
        pos === ConnectFourColor.red
          ? ConnectFourColor.red
          : pos === ConnectFourColor.yellow
            ? ConnectFourColor.yellow
            : ConnectFourColor.empty;
    }
    message += "\n";
  }
  message += "\n";
  message += `${ConnectFourColor.red}: ${userMention(red_user_id)}\n`;
  message += `${ConnectFourColor.yellow}: ${userMention(yellow_user_id)}\n\n`;
  if (is_complete) {
    if (to_move) {
      message += `Four in a row for ${
        to_move === red_user_id ? ConnectFourColor.red : ConnectFourColor.yellow
      } - ${userMention(to_move)} wins${
        wager > 0 ? ` and scoops the pot of ${wager * 2} BillyBucks` : ""
      }!`;
    } else {
      message += `It's a draw!${
        wager > 0
          ? ` The wager amount of ${wager} BillyBuck${pluralIfNotOne(
              wager,
            )} is returned to each player.`
          : ""
      }`;
    }
    return message;
  }

  message += `${
    to_move === red_user_id ? ConnectFourColor.red : ConnectFourColor.yellow
  } to move - ${userMention(to_move)}'s turn!`;
  return message;
};

// an unaccepted game is just a challenge, so there is no board to show yet
export const buildConnectFourResponse = (data: IConnectFour) =>
  data.is_accepted ? buildMoveResponse(data) : buildChallengeResponse(data);

// adds the reactions used to make moves, as long as the game is in progress
export const reactWithConnectFourMoves = async (message: Message, data: IConnectFour) => {
  if (!data.is_accepted || data.is_complete) return;
  await Promise.all(connectFourReacts.map(emoji => message.react(emoji)));
};
