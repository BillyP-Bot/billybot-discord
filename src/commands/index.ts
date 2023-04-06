import type { ICommand } from "../types";
import { albumCommand } from "./album";
import { allowanceCommand } from "./allowance";
import { amaCommand } from "./ama";
import { betCommand } from "./bet";
import { bingCommand } from "./bing";
import { birthdayCommand } from "./birthday";
import { birthdaysCommand } from "./birthdays";
import { blackjackCommand } from "./blackjack";
import { blackjackDoubleDownCommand } from "./blackjack-double-down";
import { blackjackHitCommand } from "./blackjack-hit";
import { blackjackStandCommand } from "./blackjack-stand";
import { bucksCommand } from "./bucks";
import { buyTicketCommand } from "./buy-ticket";
import { challengeCommand } from "./challenge";
import { closeBetCommand } from "./close-bet";
import { concedeCommand } from "./concede";
import { configureCommand } from "./configure";
import { connectFourCommand } from "./connect-four";
import { factCheckCommand } from "./fact-check";
import { featuresCommand } from "./feature-request";
import { foolCommand } from "./fool";
import { imageCommand } from "./image";
import { lottoCommand } from "./lotto";
import { noblemenCommand } from "./noblemen";
import { payBucksCommand } from "./pay-bucks";
import {
	clearQueueCommand,
	playYoutubeCommand,
	queueCommand,
	skipCommand
} from "./play-youtube-video";
import { serfsCommand } from "./serfs";
import { sheeshCommand } from "./sheesh";
import { spinCommand } from "./spin";
import { stockCommand } from "./stock";
import { buyStockCommand } from "./stock-buy";
import { portfolioCommand } from "./stock-portfolio";
import { sellStockCommand } from "./stock-sell";
import { taxesCommand } from "./taxes";

export { announcementsCommand } from "./admin-announcement";
export const commands: ICommand[] = [
	bingCommand,
	betCommand,
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
	challengeCommand,
	closeBetCommand,
	featuresCommand,
	foolCommand,
	playYoutubeCommand,
	skipCommand,
	queueCommand,
	clearQueueCommand,
	birthdayCommand,
	birthdaysCommand,
	sheeshCommand,
	stockCommand,
	buyStockCommand,
	sellStockCommand,
	portfolioCommand,
	connectFourCommand,
	imageCommand,
	albumCommand,
	amaCommand,
	factCheckCommand
];

export { bingCommand };
export { betCommand };
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
export { challengeCommand };
export { closeBetCommand };
export { featuresCommand };
export { foolCommand };
export { playYoutubeCommand };
export { skipCommand };
export { queueCommand };
export { clearQueueCommand };
export { birthdayCommand };
export { birthdaysCommand };
export { sheeshCommand };
export { stockCommand };
export { buyStockCommand };
export { sellStockCommand };
export { portfolioCommand };
export { connectFourCommand };
export { imageCommand };
export { albumCommand };
export { amaCommand };
export { factCheckCommand };
