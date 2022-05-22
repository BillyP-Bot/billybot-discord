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
import { featuresCommand } from "./feature-request";
import { playYoutubeCommand } from "./play-youtube-video";
import { stockCommand } from "./stock";
import { buyStockCommand } from "./stock-buy";
import { sellStockCommand } from "./stock-sell";
import { portfolioCommand } from "./stock-portfolio";

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
	featuresCommand,
	playYoutubeCommand,
	stockCommand,
	buyStockCommand,
	sellStockCommand,
	portfolioCommand
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
export { featuresCommand };
export { playYoutubeCommand };
export { stockCommand };
export { buyStockCommand };
export { sellStockCommand };
export { portfolioCommand };
