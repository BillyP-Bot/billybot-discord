import type { Message } from "discord.js";

import { Api } from "@/helpers/api";
import { assertDeveloper } from "@/helpers/role";
import { Channels } from "@/types/enums";

// messages posted by developers in the admin announcements channel get relayed to the general
// channel (via a webhook) by the backend
export const postAdminAnnouncement = async (message: Message<true>) => {
  if (!message.member) throw new Error("Guild member not found");
  assertDeveloper(message.member);
  const general = message.guild.channels.cache.get(Channels.general);
  if (!general) throw new Error("Channel not found");
  await Api.post("announcements", {
    server_id: message.guildId,
    user_id: message.author.id,
    text: message.content,
    channel_name: general.name,
  });
};
