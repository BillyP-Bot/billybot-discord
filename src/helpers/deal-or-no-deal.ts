import { DealOrNoDealReacts, type IDealOrNoDeal } from "btbot-types";
import { type Message, userMention } from "discord.js";

import { mentionCommand } from "@/helpers/command";
import { Embed } from "@/helpers/embed";
import { CommandNames } from "@/types/enums";

export const dealOrNoDealReacts: string[] = [DealOrNoDealReacts.deal, DealOrNoDealReacts.noDeal];

export const buildStatusMessage = (game: IDealOrNoDeal, justRejectedOffer?: boolean) => {
  const { cases, selected_case, last_opened_case, to_open, offer } = game;

  const openedAmounts = cases
    .filter((c, i) => c.is_open && selected_case - 1 !== i)
    .map(c => c.value);
  const openedAmountsSorted = openedAmounts.sort((a, b) => a - b).map(value => `\`$${value}\``);

  const remainingAmounts = cases.filter(c => !c.is_open).map(c => c.value);
  const remainingAmountsSorted = remainingAmounts
    .sort((a, b) => a - b)
    .map(value => `\`$${value}\``);

  let msg = "";
  if (justRejectedOffer) {
    msg += `${userMention(game.user_id)}\n\n**NO DEAL!** You reject BillyP's generous offer of \`${offer} BillyBucks\`.\n\n`;
  } else {
    const caseValue = last_opened_case > 0 ? cases[last_opened_case - 1]?.value : undefined;
    msg +=
      openedAmounts.length === 0
        ? `Welcome to Deal or No Deal! You selected case **${selected_case}**.\n\n`
        : `You opened case **${last_opened_case}** - it contains \`${caseValue} BillyBuck${
            caseValue === 1 ? "" : "s"
          }\`!\n\n`;
  }

  if (to_open > 0) {
    msg += `Cases to open before next offer: **${to_open} more**\n\n`;
    msg += `Run ${mentionCommand(CommandNames.dealornodeal)} to open a case.\n\n`;
  } else {
    msg += `The Bank of BillyP is pleased to offer you \`${offer} BillyBucks\` for your case. *DEAL* or *NO DEAL*?!?\n\n`;
    msg += `${DealOrNoDealReacts.deal} **DEAL** (accept offer and end the game)\n${DealOrNoDealReacts.noDeal} **NO DEAL** (reject offer and continue opening)\n\n`;
  }

  msg += `Your case: **${selected_case}** 🔒\n\n`;

  if (openedAmountsSorted.length > 0) msg += `Opened:\n${openedAmountsSorted.join(", ")}\n\n`;

  if (remainingAmountsSorted.length > 0)
    msg += `Remaining:\n${remainingAmountsSorted.join(", ")}\n\n`;
  return msg;
};

// shows each case as locked (the player's own case), opened (with its value), or still closed
export const buildDealOrNoDealEmbed = (game: IDealOrNoDeal, msg: string) =>
  Embed.success(msg, "Deal or No Deal").setFields(
    game.cases.map((c, i) => ({
      name: `${i + 1}`,
      value: game.selected_case - 1 === i ? "🔒" : c.is_open ? `\`$${c.value}\`` : "💼",
      inline: true,
    })),
  );

export const reactWithDealOrNoDeal = (message: Message) =>
  Promise.all([message.react(DealOrNoDealReacts.deal), message.react(DealOrNoDealReacts.noDeal)]);
