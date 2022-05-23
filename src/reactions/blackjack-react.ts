import type { MessageReaction } from "discord.js";

import { BlackjackReacts } from "btbot-types";

import { Api } from "../helpers";
import type { BlackJackGameResponse } from "../types";
import {
	blackjackHitCommand,
	blackjackStandCommand,
	blackjackDoubleDownCommand
} from "../commands";

export async function blackjackReact(react: MessageReaction, sender_id: string) {
	const game = await Api.get<BlackJackGameResponse>(
		`gamble/blackjack/server/${react.message.guild.id}?user_id=${sender_id}`
	);
	if (Object.entries(game).length === 0) return;
	switch (react.emoji.toString()) {
		case BlackjackReacts.hit:
			return blackjackHitCommand.reactHandler(react, sender_id);
		case BlackjackReacts.stand:
			return blackjackStandCommand.reactHandler(react, sender_id);
		case BlackjackReacts.doubleDown:
			return blackjackDoubleDownCommand.reactHandler(react, sender_id);
	}
}
