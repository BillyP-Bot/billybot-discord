import { SlashCommandBuilder } from "discord.js";

import type { SlashCommand } from "@/types";
import { CommandNames } from "@/types/enums";

export const sheesh: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName(CommandNames.sheesh)
    .setDescription("Sometimes you just need a sheeeeeeeeessshhh...")
    .addIntegerOption(option =>
      option
        .setName("intensity")
        .setDescription("How intense will your sheesh be?")
        .setRequired(false)
        .addChoices(
          { name: "wimpy", value: 1 },
          { name: "modest", value: 2 },
          { name: "firm", value: 3 },
          { name: "vigorous", value: 4 },
          { name: "⚠️ unstable ⚠️", value: 5 },
        ),
    ),
  async execute(interaction) {
    const intensity = interaction.options.getInteger("intensity");
    await interaction.reply(buildSheesh(intensity));
  },
};

const buildSheesh = (intensity: number | null) => {
  switch (intensity) {
    case 1:
      return "Sheeeeeeeesh...";
    case 2:
      return "Sheeeeeeeeeeeesssshhhh...";
    case 3:
      return "Sheeeeeeeeeeeeeeeeeessssssssshhhhhhhh...";
    case 4:
      return "Sheeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeessssssssssshhhhhh...";
    case 5:
      return (
        "SHEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEE" +
        "EEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEE" +
        "EEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEE" +
        "EEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEESSSSSSSSSSSSSSSSSSSSSSHHHHHHHHHHHHHHHHHHHHHHHHHHHH..."
      );
    default:
      return "Sheeeeeeeesh...";
  }
};
