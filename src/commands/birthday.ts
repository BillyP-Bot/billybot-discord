import type { IUser } from "btbot-types";
import { SlashCommandBuilder } from "discord.js";

import { Api } from "@/helpers/api";
import { Embed } from "@/helpers/embed";
import { UserError } from "@/helpers/error";
import { formatDateMMDD } from "@/helpers/util";
import type { SlashCommand } from "@/types";
import { CommandNames } from "@/types/enums";

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
// february allows the 29th, for leap day birthdays
const DAYS_IN_MONTH = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

export const birthday: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName(CommandNames.birthday)
    .setDescription("Set your own birthday if it has not already been set")
    .addIntegerOption(option =>
      option
        .setName("month")
        .setDescription("The month of your birthday")
        .setRequired(true)
        .addChoices(MONTHS.map((name, i) => ({ name, value: i + 1 }))),
    )
    .addIntegerOption(option =>
      option
        .setName("day")
        .setDescription("The day of your birthday")
        .setRequired(true)
        .setMinValue(1)
        .setMaxValue(31),
    ),
  async execute(interaction) {
    const month = interaction.options.getInteger("month", true);
    const day = interaction.options.getInteger("day", true);
    // discord can only limit the day to 1-31, so check it against the month here (before
    // deferring, so that the error is only visible to the caller)
    if (!isValidDate(month, day))
      throw new UserError(
        `Invalid date! ${MONTHS[month - 1]} ${day} is not a valid calendar date!`,
      );
    await interaction.deferReply();
    const embed = await setBirthday(interaction.guildId, interaction.user.id, month, day);
    await interaction.editReply({ embeds: [embed] });
  },
};

const isValidDate = (month: number, day: number) => {
  const daysInMonth = DAYS_IN_MONTH[month - 1];
  return daysInMonth !== undefined && day >= 1 && day <= daysInMonth;
};

const setBirthday = async (serverId: string, userId: string, month: number, day: number) => {
  const user = await Api.get<IUser>(`users?user_id=${userId}&server_id=${serverId}`);
  if (user.birthday)
    throw new UserError(
      `Your birthday is already set to ${formatDateMMDD(user.birthday)}. Cannot set again!`,
    );

  // the backend expects the same MM-DD format the command used to take as text input
  const birthday = `${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  const [updated] = await Api.put<IUser[]>("users", [
    { server_id: serverId, user_id: userId, birthday },
  ]);
  if (!updated?.birthday) throw new Error("Your birthday could not be set!");
  return Embed.success(
    `You successfully set your birthday to ${formatDateMMDD(updated.birthday)}!`,
    "Birthday Set",
  );
};
