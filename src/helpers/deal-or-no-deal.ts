import { DealOrNoDealReacts } from "btbot-types";
import { MessageReaction } from "discord.js";

export const isDealOrNoDealReact = (react: MessageReaction) => {
	return ([DealOrNoDealReacts.deal, DealOrNoDealReacts.noDeal] as string[]).includes(
		react.emoji.toString()
	);
};
