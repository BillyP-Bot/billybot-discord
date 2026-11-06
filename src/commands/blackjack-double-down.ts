import { SlashCommandBuilder } from "discord.js";

import { hitBlackjack } from "@/helpers/blackjack";
import type { SlashCommand } from "@/types";
import { CommandNames } from "@/types/enums";

export const blackjackDoubleDown: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName(CommandNames.doubledown)
    .setDescription("Double down in your current blackjack hand"),
  async execute(interaction) {
    await interaction.deferReply();
    const { embed } = await hitBlackjack(interaction.guildId, interaction.user.id, true);
    await interaction.editReply({ embeds: [embed] });
  },
};
