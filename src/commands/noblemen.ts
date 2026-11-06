import type { IUser } from "btbot-types";
import { SlashCommandBuilder, userMention } from "discord.js";

import { Api } from "@/helpers/api";
import { Embed } from "@/helpers/embed";
import type { SlashCommand } from "@/types";
import { CommandNames } from "@/types/enums";

export const noblemen: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName(CommandNames.noblemen)
    .setDescription("Get the 3 richest users in the server"),
  async execute(interaction) {
    await interaction.deferReply();
    const embed = await listNoblemen(interaction.guildId);
    await interaction.editReply({ embeds: [embed] });
  },
};

const listNoblemen = async (serverId: string) => {
  const users = await Api.get<IUser[]>(`bucks/noblemen/${serverId}`);
  const description = users
    .map(
      ({ user_id, billy_bucks }, i) =>
        `**${i + 1}.** ${userMention(user_id)} ${billy_bucks} BillyBucks\n\n`,
    )
    .join("");
  return Embed.success(description, "Noblemen");
};
