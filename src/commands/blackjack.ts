import { SlashCommandBuilder } from "discord.js";

import { Api } from "@/helpers/api";
import { buildBlackjackResponse, reactWithBlackjackMoves } from "@/helpers/blackjack";
import { Embed } from "@/helpers/embed";
import type { BlackJackGameResponse, SlashCommand } from "@/types";
import { CommandNames } from "@/types/enums";

export const blackjack: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName(CommandNames.blackjack)
    .setDescription("Play a hand of blackjack")
    .addIntegerOption(option =>
      option
        .setName("bet")
        .setDescription("The number of BillyBucks to bet")
        .setRequired(true)
        .setMinValue(10),
    ),
  async execute(interaction) {
    const bet = interaction.options.getInteger("bet", true);
    await interaction.deferReply();
    const { embed, isComplete } = await startHand(interaction.guildId, interaction.user.id, bet);
    const reply = await interaction.editReply({ embeds: [embed] });
    if (!isComplete) await reactWithBlackjackMoves(reply, true);
  },
};

const startHand = async (serverId: string, userId: string, wager: number) => {
  const data = await Api.post<BlackJackGameResponse>("gamble/blackjack", {
    server_id: serverId,
    user_id: userId,
    wager,
  });
  return {
    embed: Embed.success(buildBlackjackResponse(data, userId)),
    isComplete: data.is_complete,
  };
};
