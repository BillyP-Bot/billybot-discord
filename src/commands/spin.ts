import type { IUser } from "btbot-types";
import { SlashCommandBuilder } from "discord.js";

import { Api } from "@/helpers/api";
import { Embed } from "@/helpers/embed";
import type { SlashCommand } from "@/types";
import { CommandNames } from "@/types/enums";

export const spin: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName(CommandNames.spin)
    .setDescription("Play a spin of Roulette")
    .addIntegerOption(option =>
      option
        .setName("bet")
        .setDescription("The number of BillyBucks to bet")
        .setRequired(true)
        .setMinValue(1),
    )
    .addStringOption(option =>
      option
        .setName("color")
        .setDescription("🟥 or ⬛: 18/38 chance, 1:1 payout. 🟩: 2/38 chance, 17:1 payout.")
        .setRequired(true)
        .addChoices(
          { name: "🟥", value: "red" },
          { name: "⬛", value: "black" },
          { name: "🟩", value: "green" },
        ),
    ),
  async execute(interaction) {
    const bet = interaction.options.getInteger("bet", true);
    const color = interaction.options.getString("color", true);
    await interaction.deferReply();
    const embed = await spinRoulette(interaction.guildId, interaction.user.id, bet, color);
    await interaction.editReply({ embeds: [embed] });
  },
};

const spinRoulette = async (serverId: string, userId: string, bet: number, color: string) => {
  const { user, outcome } = await Api.post<{
    user: IUser;
    outcome: { won: boolean; payout: number; winning_color: string };
  }>("gamble/roulette/spin", { server_id: serverId, user_id: userId, color, amount: bet });
  if (!outcome.won) {
    return Embed.error(
      `It's ${outcome.winning_color}! You lose your bet of ${bet} BillyBucks! You're a DEAD MAAANNN!\n You now have ${user.billy_bucks} BillyBucks.`,
      "You Lost!",
    );
  }
  return Embed.success(
    `It's ${outcome.winning_color}! You win ${outcome.payout} BillyBucks! Lady LUUUCCCCKKK!\n You now have ${user.billy_bucks} BillyBucks.`,
    "You Won!",
  );
};
