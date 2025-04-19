import type { Message, TextChannel } from "discord.js";

import { Channels } from "@enums";
import { Api, assertDeveloper } from "@helpers";

export const postAdminAnnouncement = async (msg: Message) => {
	await assertDeveloper(msg.member);
	await msg.guild.fetch();
	const general = msg.guild.channels.cache.find(
		(channel: TextChannel) => channel.id === Channels.general
	) as TextChannel;
	if (!general) throw "channel not found";
	// post webhook announcement
	await Api.post("announcements", {
		server_id: msg.guild.id,
		user_id: msg.author.id,
		text: msg.content,
		channel_name: general.name
	});
};
