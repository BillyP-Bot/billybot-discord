import type { IStock } from "btbot-types";
import { SlashCommandBuilder } from "discord.js";

import { Api } from "@/helpers/api";
import { Embed } from "@/helpers/embed";
import type { SlashCommand } from "@/types";
import { CommandNames } from "@/types/enums";

export const stock: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName(CommandNames.stock)
    .setDescription("Look up the price of the given stock")
    .addStringOption(option =>
      option
        .setName("symbol")
        .setDescription("The ticker symbol of the stock to look up")
        .setRequired(true),
    ),
  async execute(interaction) {
    const symbol = interaction.options.getString("symbol", true);
    await interaction.deferReply();
    const embed = await getStockPrice(symbol);
    await interaction.editReply({ embeds: [embed] });
  },
};

const getStockPrice = async (symbol: string) => {
  const res = await Api.get<IStock>(`stocks/price?symbol=${encodeURIComponent(symbol)}`);
  return Embed.success(`\`${res.price} ${res.currency}\``, res.symbol);
};
