import type { Guild, GuildMember } from "discord.js";

import { UserError } from "@/helpers/error";
import { Roles } from "@/types/enums";

// role data is included in the interaction payload, so no need to fetch the member first
export const assertDeveloper = (member: GuildMember) => {
  if (!member.roles.cache.has(Roles.developer))
    throw new UserError("This command can only be run by bot developers!");
};

export const assertMayor = (member: GuildMember) => {
  const mayorRole = member.roles.cache.get(Roles.mayor);
  if (!mayorRole) throw new UserError("Only the mayor can run this command!");
  return mayorRole;
};

export const readMayor = async (guild: Guild) => {
  const members = await guild.members.fetch();
  const mayorRole = guild.roles.cache.get(Roles.mayor);
  if (!mayorRole) throw new Error("No mayor role found in this server!");
  const currentMayor = members.find(member => member.roles.cache.has(mayorRole.id));
  return { mayorRole, currentMayor };
};

export const readFool = async (guild: Guild) => {
  const members = await guild.members.fetch();
  const foolRole = guild.roles.cache.get(Roles.fool);
  if (!foolRole) throw new Error("No fool role found in this server!");
  const currentFool = members.find(member => member.roles.cache.has(foolRole.id));
  return { foolRole, currentFool };
};
