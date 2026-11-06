import { SlashCommandBuilder } from "discord.js";

import { Api } from "@/helpers/api";
import { Embed } from "@/helpers/embed";
import type { SlashCommand } from "@/types";
import { CommandNames } from "@/types/enums";

export const nba: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName(CommandNames.nba)
    .setDescription("Check when the next game for any NBA team is")
    .addStringOption(option =>
      option
        .setName("team")
        .setDescription("The name of the team to look up (defaults to Celtics)"),
    ),
  async execute(interaction) {
    const team = interaction.options.getString("team") ?? "celtics";
    await interaction.deferReply();
    const embed = await getNextGame(team);
    await interaction.editReply({ embeds: [embed] });
  },
};

const getNextGame = async (team: string) => {
  const { message } = await Api.get<{ message: string }>(`nba?team=${encodeURIComponent(team)}`);
  return Embed.success(message, "Next Game");
};
