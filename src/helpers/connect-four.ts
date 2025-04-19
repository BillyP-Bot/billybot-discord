import { ConnectFourColor, ConnectFourReacts, type IConnectFour } from "btbot-types";
import type { MessageReaction } from "discord.js";

import { CommandNames } from "@enums";
import { mentionCommand, pluralIfNotOne } from "@helpers";

export const buildConnectFourChallengeResponse = (data: IConnectFour) => {
	const { red_user_id, yellow_user_id, wager } = data;
	return `<@${red_user_id}> has challenged <@${yellow_user_id}> to a game of Connect Four${
		wager > 0 ? ` for ${wager} BillyBuck${pluralIfNotOne(wager)}` : ""
	}!\n\n<@${yellow_user_id}>: Run ${mentionCommand(
		CommandNames.connectfour
	)} to accept the challenge!`;
};

export const buildConnectFourMoveResponse = (data: IConnectFour) => {
	const { board, red_user_id, yellow_user_id, to_move, is_complete, wager } = data;
	let message = `${
		ConnectFourReacts.one +
		ConnectFourReacts.two +
		ConnectFourReacts.three +
		ConnectFourReacts.four +
		ConnectFourReacts.five +
		ConnectFourReacts.six +
		ConnectFourReacts.seven
	}\n\n`;
	for (let i = 5; i >= 0; i--) {
		for (let j = 0; j < 7; j++) {
			const pos = board[j][i];
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
	message += `${ConnectFourColor.red}: <@${red_user_id}>\n`;
	message += `${ConnectFourColor.yellow}: <@${yellow_user_id}>\n\n`;
	if (is_complete) {
		if (to_move) {
			message += `Four in a row for ${
				to_move === red_user_id ? ConnectFourColor.red : ConnectFourColor.yellow
			} - <@${to_move}> wins${
				wager > 0 ? ` and scoops the pot of ${wager * 2} BillyBucks` : ""
			}!`;
		} else {
			message += `It's a draw!${
				wager > 0
					? ` The wager amount of ${wager} BillyBuck${pluralIfNotOne(
							wager
						)} is returned to each player.`
					: ""
			}`;
		}
		return message;
	}

	message += `${
		to_move === red_user_id ? ConnectFourColor.red : ConnectFourColor.yellow
	} to move - <@${to_move}>'s turn!`;
	return message;
};

export const isConnectFourReact = (react: MessageReaction) => {
	return (
		[
			ConnectFourReacts.one,
			ConnectFourReacts.two,
			ConnectFourReacts.three,
			ConnectFourReacts.four,
			ConnectFourReacts.five,
			ConnectFourReacts.six,
			ConnectFourReacts.seven
		] as string[]
	).includes(react.emoji.toString());
};
