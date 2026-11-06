import type { IOpenAiImage } from "btbot-types";
import { type ColorResolvable, EmbedBuilder, type SendableChannels } from "discord.js";

import { PaginatedEmbed } from "@/helpers/pagination";
import { truncate } from "@/helpers/util";
import { Colors } from "@/types/enums";

// EmbedBuilder throws on an empty title or description (so pass null to omit them instead), and on
// a title or description over discord's length limits (so truncate them instead)
const MAX_TITLE_LENGTH = 256;
const MAX_DESCRIPTION_LENGTH = 4096;

export const Embed = {
  success(description?: string, title?: string, color?: ColorResolvable) {
    return new EmbedBuilder()
      .setColor(color ?? Colors.green)
      .setTitle(title ? truncate(title, MAX_TITLE_LENGTH) : null)
      .setDescription(description ? truncate(description, MAX_DESCRIPTION_LENGTH) : null);
  },
  error(description?: string, title?: string) {
    return new EmbedBuilder()
      .setColor(Colors.red)
      .setTitle(truncate(title || "Error", MAX_TITLE_LENGTH))
      .setDescription(description ? truncate(description, MAX_DESCRIPTION_LENGTH) : null);
  },
};

export const sendPaginatedImageList = async (images: IOpenAiImage[], channel: SendableChannels) => {
  const pagEmbed = new PaginatedEmbed({
    itemsPerPage: 1,
    paginationType: "description",
    showFirstLastBtns: true,
    useEmoji: true,
  })
    .setDescriptions(images.map(() => " "))
    .setImages(images.map(i => i.permalink))
    .setTitles(images.map(i => truncate(i.prompt, MAX_TITLE_LENGTH)));
  await pagEmbed.send({ options: { channel } });
};
