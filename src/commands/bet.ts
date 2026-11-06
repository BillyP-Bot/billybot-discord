import type { IBet } from "btbot-types";
import { SlashCommandBuilder, userMention } from "discord.js";

import { Api } from "@/helpers/api";
import { Embed } from "@/helpers/embed";
import type { SlashCommand } from "@/types";
import { CommandNames } from "@/types/enums";

export const bet: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName(CommandNames.bet)
    .setDescription("Bet on a participant of the current mayoral challenge")
    .addUserOption(option =>
      option
        .setName("participant")
        .setDescription("The challenge participant to bet on")
        .setRequired(true),
    )
    .addIntegerOption(option =>
      option
        .setName("amount")
        .setDescription("The number of BillyBucks to bet")
        .setRequired(true)
        .setMinValue(1),
    ),
  async execute(interaction) {
    const participant = interaction.options.getUser("participant", true);
    const amount = interaction.options.getInteger("amount", true);
    await interaction.deferReply();
    const embed = await placeBet(interaction.guildId, interaction.user.id, participant.id, amount);
    await interaction.editReply({ embeds: [embed] });
  },
};

const placeBet = async (
  serverId: string,
  userId: string,
  participantId: string,
  amount: number,
) => {
  const { billy_bucks } = await Api.post<{ bet: IBet; billy_bucks: number }>("challenges/bet", {
    server_id: serverId,
    user_id: userId,
    participant_id: participantId,
    amount,
  });
  return Embed.success(
    `You bet ${amount} BillyBucks on ${userMention(participantId)}!\n\nYou now have ${billy_bucks} BillyBucks.`,
  );
};
