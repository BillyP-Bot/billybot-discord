import { SlashCommandBuilder } from "discord.js";

import { Api } from "@/helpers/api";
import { Embed } from "@/helpers/embed";
import { getLottoDrawDateString } from "@/helpers/util";
import type { SlashCommand, UserLookup } from "@/types";
import { CommandNames } from "@/types/enums";

// the user's updated balance is keyed by their user id alongside the ticket cost
type TicketPurchase = { ticket_cost: number; [userId: string]: number | UserLookup[string] };

export const buyTicket: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName(CommandNames.ticket)
    .setDescription("Buy a ticket for a chance to win this week's lottery"),
  async execute(interaction) {
    await interaction.deferReply();
    const embed = await purchaseTicket(interaction.guildId, interaction.user.id);
    await interaction.editReply({ embeds: [embed] });
  },
};

const purchaseTicket = async (serverId: string, userId: string) => {
  const data = await Api.post<TicketPurchase>("lottery", { server_id: serverId, user_id: userId });
  const { billy_bucks } = data[userId] as UserLookup[string];
  let body = `You bought a lottery ticket for ${data.ticket_cost} BillyBucks!\n\n`;
  body += `You now have ${billy_bucks} BillyBucks. A winner will be picked on ${getLottoDrawDateString()}!`;
  return Embed.success(body, "Lottery Ticket Purchased");
};
