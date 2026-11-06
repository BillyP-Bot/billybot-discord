import { SlashCommandBuilder, userMention } from "discord.js";

import { Api } from "@/helpers/api";
import { Embed } from "@/helpers/embed";
import type { SlashCommand, UserLookup } from "@/types";
import { CommandNames } from "@/types/enums";

export const allowance: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName(CommandNames.allowance)
    .setDescription("Collect your weekly BillyBuck allowance (only available once a week)"),
  async execute(interaction) {
    await interaction.deferReply();
    const embed = await collectAllowance(interaction.guildId, interaction.user.id);
    await interaction.editReply({ embeds: [embed] });
  },
};

const collectAllowance = async (serverId: string, userId: string) => {
  const data = await Api.post<UserLookup>("bucks/allowance", {
    server_id: serverId,
    user_id: userId,
  });
  const { billy_bucks } = data[userId];
  return Embed.success(
    `Here's your allowance, ${userMention(userId)}! You now have ${billy_bucks} BillyBucks.`,
    "+200",
  );
};
