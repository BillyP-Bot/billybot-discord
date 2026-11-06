import { SlashCommandBuilder } from "discord.js";

import { hitBlackjack, reactWithBlackjackMoves } from "@/helpers/blackjack";
import type { SlashCommand } from "@/types";
import { CommandNames } from "@/types/enums";

export const blackjackHit: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName(CommandNames.hit)
    .setDescription("Hit in your current blackjack hand"),
  async execute(interaction) {
    await interaction.deferReply();
    const { embed, isComplete } = await hitBlackjack(
      interaction.guildId,
      interaction.user.id,
      false,
    );
    const reply = await interaction.editReply({ embeds: [embed] });
    if (!isComplete) await reactWithBlackjackMoves(reply, false);
  },
};
