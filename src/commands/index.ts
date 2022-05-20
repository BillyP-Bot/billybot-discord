import type { ICommand } from "../types";
import { bingCommand } from "./bing";
import { bucksCommand } from "./bucks";
import { lottoCommand } from "./lotto";
import { buyTicketCommand } from "./buy-ticket";
import { payBucksCommand } from "./pay-bucks";
import { allowanceCommand } from "./allowance";
import { noblemenCommand } from "./noblemen";
import { serfsCommand } from "./serfs";
import { spinCommand } from "./spin";
import { blackjackCommand } from "./blackjack";
import { blackjackHitCommand } from "./blackjack-hit";
import { blackjackStandCommand } from "./blackjack-stand";
import { blackjackDoubleDownCommand } from "./blackjack-double-down";
import { taxesCommand } from "./taxes";
import { configureCommand } from "./configure";
import { concedeCommand } from "./concede";
import { playYoutubeCommand } from "./play-youtube-video";

export { announcementsCommand } from "./admin-announcement";
export const handlers: ICommand[] = [
	bingCommand,
	bucksCommand,
	lottoCommand,
	buyTicketCommand,
	payBucksCommand,
	allowanceCommand,
	noblemenCommand,
	serfsCommand,
	spinCommand,
	blackjackCommand,
	blackjackHitCommand,
	blackjackStandCommand,
	blackjackDoubleDownCommand,
	taxesCommand,
	configureCommand,
	concedeCommand,
	playYoutubeCommand
];

export { bingCommand };
export { bucksCommand };
export { lottoCommand };
export { buyTicketCommand };
export { payBucksCommand };
export { allowanceCommand };
export { noblemenCommand };
export { serfsCommand };
export { spinCommand };
export { blackjackCommand };
export { blackjackHitCommand };
export { blackjackStandCommand };
export { blackjackDoubleDownCommand };
export { taxesCommand };
export { configureCommand };
export { concedeCommand };
export { playYoutubeCommand };
