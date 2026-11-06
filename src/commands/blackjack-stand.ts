import { SlashCommandBuilder } from "discord.js";

import { standBlackjack } from "@/helpers/blackjack";
import type { SlashCommand } from "@/types";
import { CommandNames } from "@/types/enums";

export const blackjackStand: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName(CommandNames.stand)
    .setDescription("Stand in your current blackjack hand"),
  async execute(interaction) {
    await interaction.deferReply();
    const embed = await standBlackjack(interaction.guildId, interaction.user.id);
    await interaction.editReply({ embeds: [embed] });
  },
};
