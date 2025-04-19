import { ConnectFourReacts, type IConnectFour } from "btbot-types";
import type { MessageReaction } from "discord.js";

import { sendConnectFourResponseMessage } from "@commands";
import { Api, buildConnectFourMoveResponse } from "@helpers";

export async function connectFourReact(react: MessageReaction, sender_id: string) {
	const game = await Api.get<IConnectFour>(
		`gamble/connectfour/server/${react.message.guild.id}?user_id=${sender_id}`
	);
	if (Object.entries(game).length === 0) return;
	if (!game.is_accepted || game.is_complete || game.to_move !== sender_id) return;

	let move;
	switch (react.emoji.toString()) {
		case ConnectFourReacts.one:
			move = 0;
			break;
		case ConnectFourReacts.two:
			move = 1;
			break;
		case ConnectFourReacts.three:
			move = 2;
			break;
		case ConnectFourReacts.four:
			move = 3;
			break;
		case ConnectFourReacts.five:
			move = 4;
			break;
		case ConnectFourReacts.six:
			move = 5;
			break;
		case ConnectFourReacts.seven:
			move = 6;
			break;
		default:
			return;
	}

	const data = await Api.post<IConnectFour>("gamble/connectfour/move", {
		server_id: react.message.guild.id,
		user_id: sender_id,
		move
	});

	await sendConnectFourResponseMessage(
		react.message.channel,
		buildConnectFourMoveResponse(data),
		data
	);
}
