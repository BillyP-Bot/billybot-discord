import { ApplicationCommandOptionType, SlashCommandBuilder } from "discord.js";

import { Commands } from "@/commands";
import { mentionCommand } from "@/helpers/command";
import { PaginatedEmbed } from "@/helpers/pagination";
import type { SlashCommand } from "@/types";
import { CommandNames } from "@/types/enums";

export const help: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName(CommandNames.help)
    .setDescription("Show a complete list of supported commands for this server"),
  async execute(interaction) {
    const pagEmbed = new PaginatedEmbed({
      itemsPerPage: 10,
      paginationType: "description",
      showFirstLastBtns: true,
      useEmoji: true,
    })
      .setDescriptions(buildCommandDescriptions())
      .setTitles(["Commands"]);
    await pagEmbed.send({ options: { interaction } });
  },
};

// one entry per command, or per subcommand for commands that have them, sorted by name
const buildCommandDescriptions = () =>
  Commands.map(command => command.data.toJSON())
    .sort((a, b) => a.name.localeCompare(b.name))
    .flatMap(({ name, description, options }) => {
      const subcommands =
        options?.filter(option => option.type === ApplicationCommandOptionType.Subcommand) ?? [];
      if (subcommands.length === 0) return [`${mentionCommand(name)}\n${description}\n`];
      return subcommands.map(
        subcommand => `${mentionCommand(name, subcommand.name)}\n${subcommand.description}\n`,
      );
    });
