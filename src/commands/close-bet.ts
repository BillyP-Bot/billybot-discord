import type { IParticipant } from "btbot-types";
import { SlashCommandBuilder, userMention } from "discord.js";

import { Api } from "@/helpers/api";
import { Embed } from "@/helpers/embed";
import type { BetAggregate, SlashCommand } from "@/types";
import { CommandNames } from "@/types/enums";

export const closeBet: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName(CommandNames.closebet)
    .setDescription("Close betting on the current mayoral challenge"),
  async execute(interaction) {
    await interaction.deferReply();
    const embed = await closeBetting(interaction.guildId, interaction.user.id);
    await interaction.editReply({ embeds: [embed] });
  },
};

// only a participant of the current challenge can close betting on it
const closeBetting = async (serverId: string, authorId: string) => {
  const { participants, bets_aggregate } = await Api.put<{
    participants: IParticipant[];
    bets_aggregate: BetAggregate;
  }>("challenges/close", { server_id: serverId, author_id: authorId });
  return Embed.success(
    `Closed betting on the current challenge between ${userMention(participants[0].user_id)} and ${userMention(participants[1].user_id)}\n\n${buildCurrentBetsMessage(bets_aggregate)}`,
  );
};

// lists the bets placed on each participant
const buildCurrentBetsMessage = (results: BetAggregate) => {
  if (results.length <= 0) return "No one placed any bets!";
  let content = "The current bets are:\n\n";
  const participants = results.map(({ bets }) => {
    const userBets = bets.map(({ user_id, amount }) => `• ${userMention(user_id)}:\t${amount}`);
    return `${userMention(bets[0].participant_id)}\n${userBets.join("\n")}\n`;
  });
  content += participants.join("\n\n");
  return content;
};
