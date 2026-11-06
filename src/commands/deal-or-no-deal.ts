import type { IDealOrNoDeal } from "btbot-types";
import { SlashCommandBuilder } from "discord.js";

import { Api } from "@/helpers/api";
import {
  buildDealOrNoDealEmbed,
  buildStatusMessage,
  reactWithDealOrNoDeal,
} from "@/helpers/deal-or-no-deal";
import type { SlashCommand } from "@/types";
import { CommandNames } from "@/types/enums";

export const dealOrNoDeal: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName(CommandNames.dealornodeal)
    .setDescription("Play a game of Deal or No Deal!")
    .addIntegerOption(option =>
      option
        .setName("case")
        .setDescription("The number of the case to select (1 thru 18)")
        .setRequired(true)
        .setMinValue(1)
        .setMaxValue(18),
    ),
  async execute(interaction) {
    const caseNum = interaction.options.getInteger("case", true);
    await interaction.deferReply();
    const game = await openCase(interaction.guildId, interaction.user.id, caseNum);
    const embed = buildDealOrNoDealEmbed(game, buildStatusMessage(game));
    const reply = await interaction.editReply({ embeds: [embed] });
    // all the cases for this round have been opened, so the bank makes an offer
    if (game.to_open === 0) await reactWithDealOrNoDeal(reply);
  },
};

// the first case selected in a new game becomes the player's own case
const openCase = async (serverId: string, userId: string, caseNum: number) =>
  Api.post<IDealOrNoDeal>("dealornodeal/open", {
    server_id: serverId,
    user_id: userId,
    case_num: caseNum,
  });
