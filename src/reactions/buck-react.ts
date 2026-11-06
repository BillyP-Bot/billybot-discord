import type { Message } from "discord.js";

import { Api } from "@/helpers/api";
import { logUnexpectedError } from "@/helpers/error";

// reacting with the billybuck emote tips the message's author 1 BillyBuck. this is best-effort, so
// failures aren't shown to anyone (and expected ones, like the sender being broke, aren't logged)
export const buckReact = async (message: Message<true>, senderId: string) => {
  try {
    await Api.post("bucks/pay", {
      server_id: message.guildId,
      amount: 1,
      recipient_id: message.author.id,
      sender_id: senderId,
    });
  } catch (error) {
    logUnexpectedError("billybuck tip", error);
  }
};
