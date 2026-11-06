import type { IStock } from "btbot-types";
import { SlashCommandBuilder } from "discord.js";

import { Api } from "@/helpers/api";
import { Embed } from "@/helpers/embed";
import { pluralIfNotOne } from "@/helpers/util";
import type { SlashCommand } from "@/types";
import { CommandNames } from "@/types/enums";

interface IStockBuy extends IStock {
  // whether the user already owned some of this stock
  add_on: boolean;
  bucks: number;
}

export const buyStock: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName(CommandNames.buystock)
    .setDescription("Buy stock in the given ticker symbol for the specified number of BillyBucks")
    .addStringOption(option =>
      option
        .setName("symbol")
        .setDescription("The ticker symbol of the stock to buy")
        .setRequired(true),
    )
    .addIntegerOption(option =>
      option
        .setName("amount")
        .setDescription("The number of BillyBucks to invest")
        .setRequired(true)
        .setMinValue(1),
    ),
  async execute(interaction) {
    const symbol = interaction.options.getString("symbol", true);
    const amount = interaction.options.getInteger("amount", true);
    await interaction.deferReply();
    const embed = await purchaseStock(interaction.guildId, interaction.user.id, symbol, amount);
    await interaction.editReply({ embeds: [embed] });
  },
};

const purchaseStock = async (serverId: string, userId: string, symbol: string, amount: number) => {
  const res = await Api.post<IStockBuy>("stocks/buy", {
    server_id: serverId,
    user_id: userId,
    symbol,
    amount,
  });
  let output = "";
  output += `You invested ${res.add_on ? "an additional " : ""}\`${res.amount} BillyBuck${pluralIfNotOne(
    res.amount,
  )}\` in \`${res.symbol}\` at \`${res.price} ${res.currency}\`!\n\n`;
  output += `You now have ${res.bucks} BillyBucks.`;
  return Embed.success(output, "Stock Purchased 🚀");
};
