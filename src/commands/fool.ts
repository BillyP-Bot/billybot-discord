import { type Guild, SlashCommandBuilder, userMention } from "discord.js";

import { Api } from "@/helpers/api";
import { Embed } from "@/helpers/embed";
import { UserError } from "@/helpers/error";
import { assertMayor, readFool } from "@/helpers/role";
import type { SlashCommand } from "@/types";
import { CommandNames } from "@/types/enums";

export const fool: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName(CommandNames.fool)
    .setDescription("Run by the current mayor to make another user the fool")
    .addUserOption(option =>
      option.setName("user").setDescription("The user to make the new fool").setRequired(true),
    ),
  async execute(interaction) {
    const target = interaction.options.getUser("user", true);
    // checked before deferring so that the error reply is only visible to the caller
    assertMayor(interaction.member);
    await interaction.deferReply();
    const embed = await makeFool(interaction.guild, interaction.user.id, target.id);
    await interaction.editReply({ embeds: [embed] });
  },
};

const makeFool = async (guild: Guild, mayorId: string, targetUserId: string) => {
  const { foolRole, currentFool } = await readFool(guild);
  if (targetUserId === currentFool?.id)
    throw new UserError(`${userMention(targetUserId)} is already the fool!`);
  if (targetUserId === mayorId) throw new UserError("You cannot set yourself as the fool!");
  await Api.put("users", [
    { server_id: guild.id, user_id: targetUserId, is_fool: true },
    // there may not be a current fool to demote
    ...(currentFool ? [{ server_id: guild.id, user_id: currentFool.id, is_fool: false }] : []),
  ]);
  const target = await guild.members.fetch(targetUserId);
  await Promise.all([target.roles.add(foolRole), currentFool?.roles.remove(foolRole)]);
  return Embed.success(`${userMention(targetUserId)} is now the fool!`, "Mayoral Decree!");
};
