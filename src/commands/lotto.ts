import type { IUser } from "btbot-types";
import { SlashCommandBuilder, userMention } from "discord.js";

import { Api } from "@/helpers/api";
import { mentionCommand } from "@/helpers/command";
import { Embed } from "@/helpers/embed";
import { getLottoDrawDateString } from "@/helpers/util";
import type { SlashCommand } from "@/types";
import { CommandNames } from "@/types/enums";

export const lotto: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName(CommandNames.lotto)
    .setDescription("View the current jackpot and list of entrants in this week's lottery"),
  async execute(interaction) {
    await interaction.deferReply();
    const embed = await getLottoInfo(interaction.guildId);
    await interaction.editReply({ embeds: [embed] });
  },
};

const getLottoInfo = async (serverId: string) => {
  const { entrants, ticket_cost, base_lottery_jackpot, jackpot } = await Api.get<{
    ticket_cost: number;
    jackpot: number;
    entrants: IUser[];
    base_lottery_jackpot: number;
  }>(`lottery/server/${serverId}`);
  if (entrants.length <= 0) {
    return Embed.success("No entrants yet!", "Weekly Lottery");
  }
  const ticketCommandMention = mentionCommand(CommandNames.ticket);
  let body = `A winner will be picked on ${getLottoDrawDateString()}! Run ${ticketCommandMention} to buy a ticket today for ${ticket_cost} BillyBucks!\n\n`;
  body += `Ticket Cost: ${ticket_cost}\n`;
  body += `Base Lottery Jackpot: ${base_lottery_jackpot}\n`;
  body += `Current Jackpot: ${jackpot}\n`;
  body += `Entrants: ${entrants.length}\n\n`;
  for (const { user_id } of entrants) {
    body += `${userMention(user_id)}\n`;
  }
  return Embed.success(body, "Weekly Lottery");
};
