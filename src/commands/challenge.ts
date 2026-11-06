import type { IChallenge } from "btbot-types";
import { type Guild, SlashCommandBuilder, userMention } from "discord.js";

import { Api } from "@/helpers/api";
import { mentionCommand } from "@/helpers/command";
import { Embed } from "@/helpers/embed";
import { UserError } from "@/helpers/error";
import { readMayor } from "@/helpers/role";
import type { IChallengeResponse, SlashCommand } from "@/types";
import { CommandNames } from "@/types/enums";

export const challenge: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName(CommandNames.challenge)
    .setDescription("Challenge the current mayor for the highest seat in the land")
    .addStringOption(option =>
      option.setName("details").setDescription("The details of the challenge"),
    ),
  async execute(interaction) {
    const details = interaction.options.getString("details");
    await interaction.deferReply();

    // without details, just show the current challenge
    if (!details) {
      const embed = await buildCurrentChallengeEmbed(interaction.guildId);
      await interaction.editReply({ embeds: [embed] });
      return;
    }

    const { reply, embed } = await challengeMayor(interaction.guild, interaction.user.id, details);
    // the reply pings the mayor (mentions inside of embeds don't), then the details are posted
    await interaction.editReply(reply);
    if (!interaction.channel) throw new Error("Channel not found");
    await interaction.channel.send({ embeds: [embed] });
  },
};

const buildCurrentChallengeEmbed = async (serverId: string) => {
  const { challenges } = await Api.get<IChallengeResponse>(
    `challenges/server/${serverId}?is_active=true`,
  );
  const current = challenges.at(0);
  if (!current) throw new UserError("There is no current challenge!");
  const { participants } = current;
  const mayor = participants[0].is_mayor ? participants[0] : participants[1];
  const challenger = participants[0].is_mayor ? participants[1] : participants[0];
  let content = `${userMention(challenger.user_id)} has challenged mayor ${userMention(mayor.user_id)}!\n\n`;
  content += `Use ${mentionCommand(CommandNames.bet)} to bet on a participant!\n\n`;
  content += `>>> ${current.details}`;
  return Embed.success(content, "Current Challenge");
};

const challengeMayor = async (guild: Guild, userId: string, details: string) => {
  const { currentMayor } = await readMayor(guild);
  if (!currentMayor) throw new UserError("There is no current mayor to challenge!");
  if (currentMayor.id === userId) throw new UserError("mayor cannot challenge themselves");
  await Api.post<IChallenge>("challenges", { server_id: guild.id, user_id: userId, details });
  const reply = `${userMention(currentMayor.id)}, ${userMention(userId)} has challenged you!`;
  const embed = Embed.success(
    `${userMention(userId)} has challenged mayor ${userMention(currentMayor.id)}!\n\n` +
      `Use ${mentionCommand(CommandNames.bet)} to bet on a winner.\n\n` +
      `>>> ${details}`,
    "A Challenger Approaches!",
  );
  return { reply, embed };
};
