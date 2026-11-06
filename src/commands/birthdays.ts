import type { IUser } from "btbot-types";
import { type Guild, SlashCommandBuilder } from "discord.js";

import { Api } from "@/helpers/api";
import { mentionCommand } from "@/helpers/command";
import { Embed } from "@/helpers/embed";
import { formatDateMMDD } from "@/helpers/util";
import type { SlashCommand } from "@/types";
import { CommandNames } from "@/types/enums";

export const birthdays: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName(CommandNames.birthdays)
    .setDescription("Show all birthdays that have been set"),
  async execute(interaction) {
    await interaction.deferReply();
    const embed = await listBirthdays(interaction.guild);
    await interaction.editReply({ embeds: [embed] });
  },
};

const listBirthdays = async (guild: Guild) => {
  const [users, members] = await Promise.all([
    // sorted by birthday
    Api.get<IUser[]>(`users/birthday/server/${guild.id}`),
    guild.members.fetch(),
  ]);

  // start the list from the next upcoming birthday, wrapping around to the start of the year
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayTime = today.getTime();
  const { nextBdayIndex } = users.reduce(
    (acc, { birthday }, i) => {
      if (!birthday) return acc;
      const birthdayDate = new Date(birthday);
      birthdayDate.setFullYear(today.getFullYear());
      const diff = birthdayDate.getTime() - todayTime;
      if (diff >= 0 && diff < acc.diff) {
        acc.diff = diff;
        acc.nextBdayIndex = i;
      }
      return acc;
    },
    { diff: Number.MAX_VALUE, nextBdayIndex: 0 },
  );
  const sortedUsers = users.slice(nextBdayIndex).concat(users.slice(0, nextBdayIndex));

  // only list users who are still in the server
  const output =
    sortedUsers.reduce((acc, user) => {
      const member = members.get(user.user_id);
      if (!member || !user.birthday) return acc;
      return `${acc}${member.displayName}: ${formatDateMMDD(user.birthday)}\n`;
    }, "") || "No birthdays registered!\n";
  return Embed.success(
    `${output}\nRun ${mentionCommand(CommandNames.birthday)} to set your own birthday!`,
    "Upcoming Birthdays",
  );
};
