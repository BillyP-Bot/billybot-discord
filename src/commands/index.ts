import type { ICommand } from "../types";
import { allowanceCommand } from "./allowance";
import { bingCommand } from "./bing";
import { birthdayCommand } from "./birthday";
import { blackjackCommand } from "./blackjack";
import { blackjackDoubleDownCommand } from "./blackjack-double-down";
import { blackjackHitCommand } from "./blackjack-hit";
import { blackjackStandCommand } from "./blackjack-stand";
import { bucksCommand } from "./bucks";
import { buyTicketCommand } from "./buy-ticket";
import { concedeCommand } from "./concede";
import { configureCommand } from "./configure";
import { featuresCommand } from "./feature-request";
import { foolCommand } from "./fool";
import { lottoCommand } from "./lotto";
import { noblemenCommand } from "./noblemen";
import { payBucksCommand } from "./pay-bucks";
import { playYoutubeCommand } from "./play-youtube-video";
import { serfsCommand } from "./serfs";
import { sheeshCommand } from "./sheesh";
import { spinCommand } from "./spin";
import { stockCommand } from "./stock";
import { buyStockCommand } from "./stock-buy";
import { portfolioCommand } from "./stock-portfolio";
import { sellStockCommand } from "./stock-sell";
import { taxesCommand } from "./taxes";

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
	foolCommand,
	playYoutubeCommand,
	birthdayCommand,
	sheeshCommand,
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
export { foolCommand };
export { playYoutubeCommand };
export { birthdayCommand };
export { sheeshCommand };
export { stockCommand };
export { buyStockCommand };
export { sellStockCommand };
export { portfolioCommand };
