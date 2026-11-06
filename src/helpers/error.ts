import {
  type ChatInputCommandInteraction,
  type GuildTextBasedChannel,
  type InteractionReplyOptions,
  MessageFlags,
  type ModalSubmitInteraction,
} from "discord.js";

import { Embed } from "@/helpers/embed";

// an expected error with a message meant for the user, e.g. "You cannot pay yourself!" (or a
// request the backend turned down). these are only shown to the user, while any other error is
// unexpected (a bug, an outage, etc), so it also gets logged for troubleshooting
export class UserError extends Error {}

export const logUnexpectedError = (context: string, error: unknown) => {
  if (!(error instanceof UserError)) console.error(`Unexpected error in ${context}:`, error);
};

export const getErrorMessage = (error: unknown) =>
  error instanceof Error
    ? error.message
    : typeof error === "string"
      ? error
      : "Unknown error encountered while executing this command";

export const handleInteractionError = async (
  interaction: ChatInputCommandInteraction | ModalSubmitInteraction,
  error: unknown,
) => {
  logUnexpectedError(
    interaction.isChatInputCommand()
      ? `/${interaction.commandName}`
      : `form ${interaction.customId}`,
    error,
  );
  try {
    const embeds = [Embed.error(getErrorMessage(error))];
    const options: InteractionReplyOptions = { embeds, flags: MessageFlags.Ephemeral };
    // a deferred reply is still showing "thinking...", so replace it (it keeps the deferral's
    // visibility either way). once something has been sent, add a private message instead
    if (interaction.deferred && !interaction.replied) await interaction.editReply({ embeds });
    else if (interaction.replied) await interaction.followUp(options);
    else await interaction.reply(options);
  } catch (replyError) {
    // replying can fail too (e.g. the interaction expired), and an unhandled rejection kills the bot
    console.error("Failed to reply with an error:", replyError);
  }
};

// for message and reaction events, which have no interaction to reply to
export const sendErrorToChannel = async (channel: GuildTextBasedChannel, error: unknown) => {
  logUnexpectedError(`#${channel.name}`, error);
  try {
    await channel.send({ embeds: [Embed.error(getErrorMessage(error))] });
  } catch (sendError) {
    console.error("Failed to send an error message:", sendError);
  }
};
