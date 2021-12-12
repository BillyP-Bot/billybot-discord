import { Message, Collection, GuildMember } from "discord.js";

import { client } from "../helpers/client";
import { BtBackend } from "../services/rest";
import { ICommandHandler, IUser } from "../types";

export default {
	case: "configure",
	requiredArgs: false,
	arguments: [],
	properUsage: "!configure",
	resolver: async (msg: Message) => {
		const devRole = msg.member.roles.cache.find(a => a.name == "BillyPBotDev");
		if (!devRole) throw new Error("user permission denied");

		const users: Partial<IUser>[] = [];

		const serverId: string = msg.guild.id;
		const guild = await client.guilds.fetch(serverId);

		const members: Collection<string, GuildMember> = await guild.members.fetch();
		const notBots: Collection<string, GuildMember> = members.filter(a => a.user.bot == false);

		notBots.forEach(({ user }) => {
			users.push({
				username: user.username,
				user_id: user.id,
				server_id: serverId
			});
		});
		const { data } = await BtBackend.Client.post("users", { users });
		const { inserted } = data;
		await msg.reply(`configuration done! ${inserted} users updated.`);
	}
} as ICommandHandler;