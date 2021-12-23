import { Message } from "discord.js";

import { client } from "../helpers/client";
import { BtBackend } from "../services/rest";
import { ErrorMessage } from "../helpers/message";
import { IAdminCommandHandler, IUser } from "../types";

export default {
	case: (msg: Message) => /!configure/.test(msg.content),
	resolver: async (msg: Message) => {
		try {
			const users: Partial<IUser>[] = [];
			
			const serverId: string = msg.guild.id;
			const guild = await client.guilds.fetch(serverId);

			const members = await guild.members.fetch();
			const notBots = members.filter(a => a.user.bot == false);
			
			notBots.forEach(({ user }) => {
				users.push({
					username: user.username,
					user_id: user.id,
					server_id: serverId
				});
			});
			const { data } = await BtBackend.Client.post("users", { users });
			const { inserted } = data;
			await msg.reply(`configuration done! ${inserted.count} users updated.`);
		} catch (error) {
			ErrorMessage(msg, error);
		}
	}
} as IAdminCommandHandler;