import { DealOrNoDealReacts, type IDealOrNoDeal, type IUser } from "btbot-types";
import { type Message, userMention } from "discord.js";

import { Api } from "@/helpers/api";
import { buildDealOrNoDealEmbed, buildStatusMessage } from "@/helpers/deal-or-no-deal";
import { Embed } from "@/helpers/embed";

// accepts or rejects the bank's offer in the reacting user's active game
export const dealOrNoDealReact = async (message: Message<true>, emoji: string, userId: string) => {
  const isDeal = emoji === DealOrNoDealReacts.deal;
  const game = await Api.put<IDealOrNoDeal | null>("dealornodeal/respond", {
    server_id: message.guildId,
    user_id: userId,
    is_deal: isDeal,
  });
  // the backend responds with null if the user has no active game
  if (!game || game.user_id !== userId) return;

  if (!game.is_complete) {
    const embed = buildDealOrNoDealEmbed(game, buildStatusMessage(game, true));
    await message.channel.send({ embeds: [embed] });
    return;
  }

  const { billy_bucks } = await Api.get<IUser>(
    `users?user_id=${game.user_id}&server_id=${game.server_id}`,
  );
  const ownCaseValue = game.cases[game.selected_case - 1]?.value;
  const winnings = isDeal ? game.offer : ownCaseValue;
  const embed = Embed.success(
    isDeal
      ? `${userMention(game.user_id)}\n\n**DEAL!** You accepted the bank's offer of ${winnings} BillyBucks.\n\nYou now have ${billy_bucks} BillyBucks.\n\nYour case contained... \`${ownCaseValue} BillyBucks\`!`
      : `${userMention(game.user_id)}\n\n**NO DEAL!** You reject BillyP's generous offer of \`${game.offer} BillyBucks\`.\n\nThere are only two unopened cases left, so you automatically win the contents of your own case: \`${winnings} BillyBucks\`!\n\nYou now have ${billy_bucks} BillyBucks.`,
    "Deal or No Deal",
  );
  await message.channel.send({ embeds: [embed] });
};
