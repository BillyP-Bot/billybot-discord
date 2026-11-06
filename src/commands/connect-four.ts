import type { IConnectFour } from "btbot-types";
import { SlashCommandBuilder } from "discord.js";

import { Api } from "@/helpers/api";
import { buildConnectFourResponse, reactWithConnectFourMoves } from "@/helpers/connect-four";
import type { SlashCommand } from "@/types";
import { CommandNames } from "@/types/enums";

export const connectFour: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName(CommandNames.connectfour)
    .setDescription("Play a game of Connect Four against another user")
    .addUserOption(option =>
      option
        .setName("user")
        .setDescription(
          "The user you want to send a new challenge to or accept an existing challenge from",
        )
        .setRequired(true),
    )
    .addIntegerOption(option =>
      option
        .setName("bet")
        .setDescription("The number of BillyBucks to bet on the game")
        .setMinValue(1),
    ),
  async execute(interaction) {
    const opponent = interaction.options.getUser("user", true);
    const bet = interaction.options.getInteger("bet") ?? 0;
    await interaction.deferReply();
    const game = await challengeOrAccept(
      interaction.guildId,
      interaction.user.id,
      opponent.id,
      bet,
    );
    const reply = await interaction.editReply(buildConnectFourResponse(game));
    await reactWithConnectFourMoves(reply, game);
  },
};

// challenges the other user, or accepts their challenge (starting the game) if they sent one first
const challengeOrAccept = async (
  serverId: string,
  userId: string,
  opponentId: string,
  bet: number,
) =>
  Api.post<IConnectFour>("gamble/connectfour/challenge", {
    server_id: serverId,
    user_id: userId,
    mentioned_user_id: opponentId,
    wager: bet,
  });
