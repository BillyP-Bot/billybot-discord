import type { IOpenAiImage } from "btbot-types";
import { SlashCommandBuilder } from "discord.js";

import { Api } from "@/helpers/api";
import { Embed } from "@/helpers/embed";
import type { SlashCommand } from "@/types";
import { CommandNames } from "@/types/enums";

export const image: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName(CommandNames.image)
    .setDescription("Get an AI-generated image based on your input")
    .addStringOption(option =>
      option
        .setName("prompt")
        .setDescription("The word or phrase to generate the image based on")
        .setMaxLength(950)
        .setRequired(true),
    ),
  async execute(interaction) {
    const prompt = interaction.options.getString("prompt", true);
    await interaction.deferReply();
    const embed = await generateImage(interaction.guildId, interaction.user.id, prompt);
    await interaction.editReply({ embeds: [embed] });
  },
};

const generateImage = async (serverId: string, userId: string, prompt: string) => {
  const { permalink } = await Api.post<IOpenAiImage>("images", {
    prompt,
    user_id: userId,
    server_id: serverId,
  });
  return Embed.success(undefined, prompt).setImage(permalink);
};
