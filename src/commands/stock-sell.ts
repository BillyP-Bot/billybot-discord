import type { IStock } from "btbot-types";
import { SlashCommandBuilder } from "discord.js";

import { Api } from "@/helpers/api";
import { Embed } from "@/helpers/embed";
import { getTrendEmoji, pluralIfNotOne, plusSignIfNotNegative } from "@/helpers/util";
import type { SlashCommand } from "@/types";
import { CommandNames } from "@/types/enums";

interface IStockSell extends IStock {
  // net gain or loss on the sale
  delta: number;
  bucks: number;
}

export const sellStock: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName(CommandNames.sellstock)
    .setDescription("Sell all stock you own in the given ticker symbol")
    .addStringOption(option =>
      option
        .setName("symbol")
        .setDescription("The ticker symbol of the stock to sell")
        .setRequired(true),
    ),
  async execute(interaction) {
    const symbol = interaction.options.getString("symbol", true);
    await interaction.deferReply();
    const embed = await sell(interaction.guildId, interaction.user.id, symbol);
    await interaction.editReply({ embeds: [embed] });
  },
};

const sell = async (serverId: string, userId: string, symbol: string) => {
  const res = await Api.post<IStockSell>("stocks/sell", {
    server_id: serverId,
    user_id: userId,
    symbol,
  });
  let output = "";
  output += `You sold your stock in \`${res.symbol}\` at \`${res.price} ${res.currency}\` for \`${
    res.amount
  } BillyBuck${pluralIfNotOne(res.amount)}\`!\n\n`;
  output += `Net Gain/Loss: \`${plusSignIfNotNegative(res.delta)}${
    res.delta
  } BillyBuck${pluralIfNotOne(res.delta)}\` ${getTrendEmoji(res.delta)}\n\n`;
  output += `You now have ${res.bucks} BillyBucks.`;
  return Embed.success(output, "Stock Sold 💰");
};
