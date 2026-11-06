import { SlashCommandBuilder, userMention } from "discord.js";

import { Api } from "@/helpers/api";
import { Embed } from "@/helpers/embed";
import { UserError } from "@/helpers/error";
import type { SlashCommand, UserLookup } from "@/types";
import { CommandNames } from "@/types/enums";

export const payBucks: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName(CommandNames.pay)
    .setDescription("Pay BillyBucks directly to another user")
    .addUserOption(option =>
      option.setName("user").setDescription("The user to pay BillyBucks to").setRequired(true),
    )
    .addIntegerOption(option =>
      option
        .setName("amount")
        .setDescription("The number of BillyBucks to pay the other user")
        .setRequired(true)
        .setMinValue(1),
    ),
  async execute(interaction) {
    const recipient = interaction.options.getUser("user", true);
    const amount = interaction.options.getInteger("amount", true);
    await interaction.deferReply();
    const embed = await pay(interaction.guildId, interaction.user.id, recipient.id, amount);
    await interaction.editReply({ embeds: [embed] });
  },
};

const pay = async (serverId: string, senderId: string, recipientId: string, amount: number) => {
  if (senderId === recipientId) throw new UserError("You cannot pay yourself!");
  if (amount < 1) throw new UserError("Amount must be a positive integer!");
  const data = await Api.post<UserLookup>("bucks/pay", {
    server_id: serverId,
    amount,
    recipient_id: recipientId,
    sender_id: senderId,
  });
  const { billy_bucks } = data[senderId];
  return Embed.success(
    `You paid ${userMention(recipientId)} ${amount} BillyBucks!\nYou now have ${billy_bucks} BillyBucks.`,
    "Payment Successful",
  );
};
