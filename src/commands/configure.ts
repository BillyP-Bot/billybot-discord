import type { IUser } from "btbot-types";
import { type Guild, SlashCommandBuilder } from "discord.js";

import { Api } from "@/helpers/api";
import { getErrorMessage, logUnexpectedError } from "@/helpers/error";
import { assertDeveloper } from "@/helpers/role";
import type { SlashCommand } from "@/types";
import { CommandNames } from "@/types/enums";

export const configure: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName(CommandNames.configure)
    .setDescription("Command for admins to prep the server"),
  async execute(interaction) {
    // checked before deferring so that the error reply is only visible to the caller
    assertDeveloper(interaction.member);
    await interaction.deferReply();
    const message = await configureServer(interaction.guild);
    await interaction.editReply(message);
  },
};

const configureServer = async (guild: Guild) => {
  let message = `Creating server record for ${guild.name}...\n`;
  try {
    await Api.post("server", { server_id: guild.id, name: guild.name, icon_hash: guild.icon });
    message += "Server record created\n";
  } catch (error) {
    // most likely "Server already exists", which is fine: carry on and sync the users anyway
    logUnexpectedError("/configure", error);
    message += `${getErrorMessage(error)}\n`;
  }
  const users = await configureGuildUsers(guild);
  message += `${users.length} user(s) configured`;
  return message;
};

// creates a user record for each (non-bot) guild member, or updates it if it already exists
// (also run whenever a new member joins the server)
export const configureGuildUsers = async (guild: Guild) => {
  const members = await guild.members.fetch();
  const users = members
    .filter(member => !member.user.bot)
    .map(({ user }) => ({
      server_id: guild.id,
      user_id: user.id,
      username: user.username,
      discriminator: user.discriminator,
      avatar_hash: user.avatar,
    }));
  return Api.post<IUser[]>("users", users);
};
