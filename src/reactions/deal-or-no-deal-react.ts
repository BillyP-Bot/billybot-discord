import { MessageReaction } from "discord.js";

import { dealOrNoDealCommand } from "@commands";

export async function dealOrNoDealReact(react: MessageReaction, sender_id: string) {
	return dealOrNoDealCommand.reactHandler(react, sender_id);
}
