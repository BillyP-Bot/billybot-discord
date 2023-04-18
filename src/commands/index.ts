import { ISlashCommand } from "@types";

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
import { configureCommand, configureGuildUsers } from "./configure";
import { connectFourCommand, sendConnectFourResponseMessage } from "./connect-four";
import { factCheckCommand } from "./fact-check";
import { featuresCommand, postFeature } from "./feature-request";
import { foolCommand } from "./fool";
import { helpCommand } from "./help";
import { imageCommand } from "./image";
import { lottoCommand } from "./lotto";
import { nbaCommand } from "./nba";
import { noblemenCommand } from "./noblemen";
import { payBucksCommand } from "./pay-bucks";
import {
	clearQueueCommand,
	clearVideoQueue,
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

export const commands: ISlashCommand[] = [
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
	factCheckCommand,
	helpCommand,
	nbaCommand
];

export const commandsLookup = commands.reduce((acc, command) => {
	acc[command.name] = command;
	return acc;
}, {} as Record<string, ISlashCommand>);

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
export { configureGuildUsers };
export { concedeCommand };
export { challengeCommand };
export { closeBetCommand };
export { featuresCommand };
export { postFeature };
export { foolCommand };
export { playYoutubeCommand };
export { skipCommand };
export { queueCommand };
export { clearQueueCommand };
export { clearVideoQueue };
export { birthdayCommand };
export { birthdaysCommand };
export { sheeshCommand };
export { stockCommand };
export { buyStockCommand };
export { sellStockCommand };
export { portfolioCommand };
export { connectFourCommand };
export { sendConnectFourResponseMessage };
export { imageCommand };
export { albumCommand };
export { amaCommand };
export { factCheckCommand };
export { helpCommand };
export { nbaCommand };
