import { SlashCommandBuilder } from "discord.js";

import type { SlashCommand } from "@/types";
import { CommandNames } from "@/types/enums";

export const bing: SlashCommand = {
  data: new SlashCommandBuilder().setName(CommandNames.bing).setDescription("bong?"),
  async execute(interaction) {
    await interaction.reply("bong");
  },
};
