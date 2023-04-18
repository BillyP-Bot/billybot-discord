import { Guild, GuildMember } from "discord.js";

import { Roles } from "@enums";

export const assertMayor = async (member: GuildMember) => {
	await member.fetch();
	const mayorRole = member.roles.cache.find((a) => a.id == Roles.mayor);
	if (!mayorRole) throw "only the mayor can run this command!";
	return mayorRole;
};

export const readMayor = async (guild: Guild) => {
	await guild.members.fetch();
	const mayorRole = guild.roles.cache.find((a) => a.id == Roles.mayor);
	const currentMayor = guild.members.cache.find((a) => a.roles.cache.has(mayorRole.id));
	return { mayorRole, currentMayor };
};

export const readFool = async (guild: Guild) => {
	await guild.members.fetch();
	const foolRole = guild.roles.cache.find((a) => a.id == Roles.fool);
	const currentFool = guild.members.cache.find((a) => a.roles.cache.has(foolRole.id));
	return { foolRole, currentFool };
};

export const assertDeveloper = async (member: GuildMember) => {
	await member.fetch();
	const devRole = member.roles.cache.find((a) => a.id == Roles.developer);
	if (!devRole) throw "unauthorized";
};
