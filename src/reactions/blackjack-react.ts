import { BlackjackReacts } from "btbot-types";
import type { MessageReaction } from "discord.js";

import { blackjackDoubleDownCommand, blackjackHitCommand, blackjackStandCommand } from "@commands";
import { Api } from "@helpers";
import type { BlackJackGameResponse } from "@types";

export async function blackjackReact(react: MessageReaction, sender_id: string) {
	const game = await Api.get<BlackJackGameResponse>(
		`gamble/blackjack/server/${react.message.guild.id}?user_id=${sender_id}`
	);
	if (Object.entries(game).length === 0) return;
	switch (react.emoji.toString()) {
		case BlackjackReacts.hit:
			return await blackjackHitCommand.reactHandler(react, sender_id);
		case BlackjackReacts.stand:
			return await blackjackStandCommand.reactHandler(react, sender_id);
		case BlackjackReacts.doubleDown:
			return await blackjackDoubleDownCommand.reactHandler(react, sender_id);
	}
}
