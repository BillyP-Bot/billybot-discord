import type { IFeature } from "btbot-types";
import {
  ModalBuilder,
  type ModalSubmitInteraction,
  SlashCommandBuilder,
  TextInputStyle,
} from "discord.js";

import { Api } from "@/helpers/api";
import { Config } from "@/helpers/config";
import { Embed } from "@/helpers/embed";
import type { SlashCommand } from "@/types";
import { CommandNames } from "@/types/enums";

export const FEATURE_MODAL_ID = "featureModal";
const TITLE_INPUT_ID = "featureTitleInput";
const DETAILS_INPUT_ID = "featureDetailsInput";

// opens a form for the feature details, which is handled by postFeature when submitted
export const featureRequest: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName(CommandNames.feature)
    .setDescription(
      "Use your BillyBucks to submit a new idea for the BillyP Bot to the developers",
    ),
  async execute(interaction) {
    const modal = new ModalBuilder()
      .setCustomId(FEATURE_MODAL_ID)
      .setTitle("Feature Request")
      .addLabelComponents(
        label =>
          label
            .setLabel("New Feature Request Title")
            .setTextInputComponent(input =>
              input.setCustomId(TITLE_INPUT_ID).setStyle(TextInputStyle.Short),
            ),
        label =>
          label
            .setLabel("New Feature Request Details")
            .setTextInputComponent(input =>
              input.setCustomId(DETAILS_INPUT_ID).setStyle(TextInputStyle.Paragraph),
            ),
      );
    await interaction.showModal(modal);
  },
};

export const postFeature = async (interaction: ModalSubmitInteraction<"cached">) => {
  const title = interaction.fields.getTextInputValue(TITLE_INPUT_ID);
  const body = interaction.fields.getTextInputValue(DETAILS_INPUT_ID);
  await interaction.deferReply();
  const embed = await submitFeature(interaction.guildId, interaction.user.id, title, body);
  await interaction.editReply({ embeds: [embed] });
};

const submitFeature = async (serverId: string, userId: string, title: string, body: string) => {
  const result = await Api.post<{ feature: IFeature; billy_bucks: number }>("features", {
    server_id: serverId,
    user_id: userId,
    title,
    body,
  });
  return Embed.success(
    `\`${result.feature.title}\` has been posted to the [Dashboard](${Config.DASHBOARD_URL}/${serverId})!\n\n> *${result.feature.body}*\n\nYou now have ${result.billy_bucks} BillyBucks.`,
    "Feature Posted",
  );
};
