import type { IStock } from "btbot-types";
import { SlashCommandBuilder } from "discord.js";

import { Api } from "@/helpers/api";
import { Embed } from "@/helpers/embed";
import { getTrendEmoji, pluralIfNotOne, plusSignIfNotNegative } from "@/helpers/util";
import type { SlashCommand } from "@/types";
import { CommandNames } from "@/types/enums";

interface IPortfolio {
  stocks: IPortfolioStock[];
  // uninvested balance
  bucks: number;
}

interface IPortfolioStock extends IStock {
  price_bought: number;
  price_current: number;
  amount_worth: number;
}

export const stockPortfolio: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName(CommandNames.portfolio)
    .setDescription("View info on your active investments"),
  async execute(interaction) {
    await interaction.deferReply();
    const embed = await getPortfolio(interaction.guildId, interaction.user.id);
    await interaction.editReply({ embeds: [embed] });
  },
};

const getPortfolio = async (serverId: string, userId: string) => {
  const { stocks, bucks } = await Api.post<IPortfolio>("stocks/portfolio", {
    server_id: serverId,
    user_id: userId,
  });
  let output = "";
  let net = 0;
  for (const { amount_worth, amount, price_current, price_bought, symbol, currency } of stocks) {
    const amountDiff = amount_worth - amount;
    net += amountDiff;
    const priceDiff = price_current - price_bought;
    output += `**${symbol}** ${getTrendEmoji(amountDiff)}\n`;
    output += `Net Gain/Loss: \`${plusSignIfNotNegative(
      amountDiff,
    )}${amountDiff} BillyBuck${pluralIfNotOne(Math.abs(amountDiff))} (${plusSignIfNotNegative(
      priceDiff,
    )}${((priceDiff * 100) / price_bought).toFixed(2)}%)\`\n`;
    output += `Amount Invested: \`${amount} BillyBuck${pluralIfNotOne(amount)}\`\n`;
    output += `Current Value: \`${amount_worth} BillyBuck${pluralIfNotOne(amount_worth)}\`\n`;
    output += `Avg Price Bought At: \`${price_bought} ${currency}\`\n`;
    output += `Current Price: \`${price_current} ${currency}\`\n\n`;
  }
  output += `Uninvested Cash: \`${bucks} BillyBuck${pluralIfNotOne(bucks)}\``;
  return Embed.success(
    output,
    `Stock Portfolio ${getTrendEmoji(net)} \`${plusSignIfNotNegative(
      net,
    )}${net} BillyBuck${pluralIfNotOne(net)}\``,
  );
};
