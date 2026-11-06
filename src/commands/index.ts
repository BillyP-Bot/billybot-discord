import { album } from "@/commands/album";
import { allowance } from "@/commands/allowance";
import { ama } from "@/commands/ama";
import { bet } from "@/commands/bet";
import { bing } from "@/commands/bing";
import { birthday } from "@/commands/birthday";
import { birthdays } from "@/commands/birthdays";
import { blackjack } from "@/commands/blackjack";
import { blackjackDoubleDown } from "@/commands/blackjack-double-down";
import { blackjackHit } from "@/commands/blackjack-hit";
import { blackjackStand } from "@/commands/blackjack-stand";
import { bucks } from "@/commands/bucks";
import { buyTicket } from "@/commands/buy-ticket";
import { challenge } from "@/commands/challenge";
import { closeBet } from "@/commands/close-bet";
import { concede } from "@/commands/concede";
import { configure } from "@/commands/configure";
import { connectFour } from "@/commands/connect-four";
import { dealOrNoDeal } from "@/commands/deal-or-no-deal";
import { featureRequest } from "@/commands/feature-request";
import { fool } from "@/commands/fool";
import { help } from "@/commands/help";
import { image } from "@/commands/image";
import { lotto } from "@/commands/lotto";
import { nba } from "@/commands/nba";
import { noblemen } from "@/commands/noblemen";
import { payBucks } from "@/commands/pay-bucks";
import { serfs } from "@/commands/serfs";
import { sheesh } from "@/commands/sheesh";
import { spin } from "@/commands/spin";
import { sportsBetting } from "@/commands/sports-betting";
import { stock } from "@/commands/stock";
import { buyStock } from "@/commands/stock-buy";
import { stockPortfolio } from "@/commands/stock-portfolio";
import { sellStock } from "@/commands/stock-sell";
import { taxes } from "@/commands/taxes";
import type { SlashCommand } from "@/types";

export const Commands: SlashCommand[] = [
  album,
  allowance,
  ama,
  bet,
  bing,
  birthday,
  birthdays,
  blackjack,
  blackjackDoubleDown,
  blackjackHit,
  blackjackStand,
  bucks,
  buyStock,
  buyTicket,
  challenge,
  closeBet,
  concede,
  configure,
  connectFour,
  dealOrNoDeal,
  featureRequest,
  fool,
  help,
  image,
  lotto,
  nba,
  noblemen,
  payBucks,
  sellStock,
  serfs,
  sheesh,
  spin,
  sportsBetting,
  stock,
  stockPortfolio,
  taxes,
];
