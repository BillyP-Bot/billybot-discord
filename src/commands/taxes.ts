import type { IUser } from "btbot-types";
import { channelMention, SlashCommandBuilder, userMention } from "discord.js";

import { Api } from "@/helpers/api";
import { Embed } from "@/helpers/embed";
import { UserError } from "@/helpers/error";
import { assertMayor } from "@/helpers/role";
import type { SlashCommand } from "@/types";
import { Channels, CommandNames } from "@/types/enums";

export const taxes: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName(CommandNames.taxes)
    .setDescription("The current mayor collects taxes from all middle and upper-class citizens"),
  async execute(interaction) {
    // checked before deferring so that the error reply is only visible to the caller
    assertMayor(interaction.member);
    if (interaction.channelId !== Channels.general)
      throw new UserError(
        `Taxes can only be collected in the ${channelMention(Channels.general)} channel, coward!`,
      );
    await interaction.deferReply();
    const embed = await collectTaxes(interaction.guildId, interaction.user.id);
    await interaction.editReply({ embeds: [embed] });
  },
};

const collectTaxes = async (serverId: string, mayorId: string) => {
  const data = await Api.post<{
    payout: number;
    tax_rate: number;
    charged_users: number;
    user: IUser;
  }>("bucks/taxes", { server_id: serverId, user_id: mayorId });
  let text = `${data.tax_rate} BillyBucks have been collected from ${data.charged_users} citizens!\n`;
  text += `Collection Payout: +${data.payout}\n`;
  text += `Mayor ${userMention(mayorId)} now has ${data.user.billy_bucks} BillyBucks.`;
  return Embed.success(text, "Tax Time!");
};
