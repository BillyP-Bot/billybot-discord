import type { IUser } from "btbot-types";
import { type GuildMember, SlashCommandBuilder, userMention } from "discord.js";

import { Api } from "@/helpers/api";
import { Embed } from "@/helpers/embed";
import { assertMayor, readFool } from "@/helpers/role";
import type { SlashCommand } from "@/types";
import { CommandNames } from "@/types/enums";

export const concede: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName(CommandNames.concede)
    .setDescription("The current mayor makes another user the mayor")
    .addUserOption(option =>
      option
        .setName("user")
        .setDescription("The user to make mayor (can be called on self)")
        .setRequired(true),
    ),
  async execute(interaction) {
    const target = interaction.options.getUser("user", true);
    // checked before deferring so that the error reply is only visible to the caller
    const mayorRole = assertMayor(interaction.member);
    await interaction.deferReply();
    const embed = await resolveChallenge(interaction.member, mayorRole.id, target.id);
    await interaction.editReply({ embeds: [embed] });
  },
};

// resolves the current challenge: the target becomes (or stays) the mayor, and the other
// participant becomes the fool
const resolveChallenge = async (mayor: GuildMember, mayorRoleId: string, targetUserId: string) => {
  const { guild } = mayor;
  const { foolRole, currentFool } = await readFool(guild);
  const { new_mayor_id, new_fool_id, results } = await Api.put<{
    new_mayor_id: string;
    new_fool_id: string;
    // the users who bet on the winner
    results: IUser[];
  }>("challenges/resolve", { server_id: guild.id, participant_id: targetUserId });
  const [newMayor, newFool] = await Promise.all([
    guild.members.fetch(new_mayor_id),
    guild.members.fetch(new_fool_id),
  ]);
  await Promise.all([
    newMayor.roles.add(mayorRoleId),
    newFool.roles.remove(mayorRoleId),
    newFool.roles.add(foolRole),
    // the current fool may also be the new fool, in which case this would race with adding it
    currentFool && currentFool.id !== newFool.id ? currentFool.roles.remove(foolRole) : undefined,
  ]);
  return Embed.success(
    `${userMention(newMayor.id)} is now the mayor!\n${userMention(newFool.id)} is the new fool!\n\n${buildCongratsMessage(results)}`,
    "Mayoral Decree!",
  );
};

const buildCongratsMessage = (results: IUser[]) => {
  if (results.length <= 0) return "No one bet correctly!";
  let content = "Congratulations to:\n";
  for (const { user_id } of results) {
    content += `${userMention(user_id)}\n`;
  }
  content += "\nfor their wise bets!";
  return content;
};
