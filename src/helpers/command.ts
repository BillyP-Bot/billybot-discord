import { chatInputApplicationCommandMention, inlineCode } from "discord.js";

// populated on startup, once the commands have been registered with discord
const commandIds = new Map<string, string>();

export const setCommandIds = (commands: Iterable<{ name: string; id: string }>) => {
  for (const { name, id } of commands) commandIds.set(name, id);
};

// renders a clickable command mention, or just the command name if its id is not known yet
export const mentionCommand = (name: string, subcommand?: string) => {
  const id = commandIds.get(name);
  if (!id) return inlineCode(`/${subcommand ? `${name} ${subcommand}` : name}`);
  return subcommand
    ? chatInputApplicationCommandMention(name, subcommand, id)
    : chatInputApplicationCommandMention(name, id);
};
