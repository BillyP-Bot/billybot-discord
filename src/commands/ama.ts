import type { IOpenAiCompletion } from "btbot-types";
import { SlashCommandBuilder } from "discord.js";

import { Api } from "@/helpers/api";
import { truncate } from "@/helpers/util";
import type { SlashCommand } from "@/types";
import { CommandNames } from "@/types/enums";

// discord rejects messages longer than this
const MAX_MESSAGE_LENGTH = 2000;

export const ama: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName(CommandNames.ama)
    .setDescription("Ask BillyP anything")
    .addStringOption(option =>
      option
        .setName("prompt")
        .setDescription("What would you like to ask BillyP?")
        .setMaxLength(950)
        .setRequired(true),
    ),
  async execute(interaction) {
    const prompt = interaction.options.getString("prompt", true);
    await interaction.deferReply();
    const output = await askBilly(interaction.guildId, interaction.user.id, prompt);
    await interaction.editReply(truncate(`> *${prompt}*\n\n${output}`, MAX_MESSAGE_LENGTH));
  },
};

const askBilly = async (serverId: string, userId: string, prompt: string) => {
  const { output } = await Api.post<IOpenAiCompletion>("completions", {
    prompt,
    user_id: userId,
    server_id: serverId,
  });
  return output;
};
