import type { IUser } from "btbot-types";
import { SlashCommandBuilder, userMention } from "discord.js";

import { Api } from "@/helpers/api";
import { Embed } from "@/helpers/embed";
import type { SlashCommand } from "@/types";
import { CommandNames } from "@/types/enums";

export const bucks: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName(CommandNames.bucks)
    .setDescription("View your or another user's current balance of BillyBucks")
    .addUserOption(option =>
      option
        .setName("user")
        .setDescription(
          "The user whose BillyBucks balance you want to view (runs on self if omitted)",
        ),
    ),
  async execute(interaction) {
    const user = interaction.options.getUser("user") ?? interaction.user;
    await interaction.deferReply();
    const embed = await getBucks(interaction.guildId, user.id, user.id === interaction.user.id);
    await interaction.editReply({ embeds: [embed] });
  },
};

const getBucks = async (serverId: string, userId: string, onSelf: boolean) => {
  const { billy_bucks } = await Api.get<IUser>(`users?user_id=${userId}&server_id=${serverId}`);
  return Embed.success(
    `${onSelf ? "You have" : `${userMention(userId)} has`} ${billy_bucks} BillyBucks!`,
  );
};
