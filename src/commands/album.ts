import type { IOpenAiImage } from "btbot-types";
import { SlashCommandBuilder, userMention } from "discord.js";

import { Api } from "@/helpers/api";
import { sendPaginatedImageList } from "@/helpers/embed";
import type { SlashCommand } from "@/types";
import { CommandNames } from "@/types/enums";

export const album: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName(CommandNames.album)
    .setDescription("View an album of your (or another user's) previously generated images")
    .addUserOption(option =>
      option
        .setName("user")
        .setDescription("The user whose album you want to view (runs on self if omitted)"),
    ),
  async execute(interaction) {
    const user = interaction.options.getUser("user") ?? interaction.user;
    const onSelf = user.id === interaction.user.id;
    await interaction.deferReply();
    const images = await getAlbum(interaction.guildId, user.id);
    if (images.length === 0) {
      await interaction.editReply(
        `${onSelf ? "You have" : `${userMention(user.id)} has`} not generated any images yet!`,
      );
      return;
    }
    await interaction.editReply(`${onSelf ? "Your" : `${userMention(user.id)}'s`} Images:`);
    if (!interaction.channel) throw new Error("Channel not found");
    await sendPaginatedImageList(images, interaction.channel);
  },
};

const getAlbum = async (serverId: string, userId: string) =>
  Api.get<IOpenAiImage[]>(`images?server_id=${serverId}&user_id=${userId}`);
