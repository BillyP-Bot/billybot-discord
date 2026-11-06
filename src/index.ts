import { Client, Events, GatewayIntentBits, type GuildTextBasedChannel } from "discord.js";

import { Commands } from "@/commands";
import { configureGuildUsers } from "@/commands/configure";
import { FEATURE_MODAL_ID, postFeature } from "@/commands/feature-request";
import { postAdminAnnouncement } from "@/helpers/announcement";
import { setCommandIds } from "@/helpers/command";
import { Config } from "@/helpers/config";
import { updateMessageEngagementMetrics } from "@/helpers/engagement-metrics";
import { handleInteractionError, sendErrorToChannel } from "@/helpers/error";
import { handleReaction } from "@/reactions";
import { Channels } from "@/types/enums";

// catch-all for stray promise rejections which would otherwise kill the bot
process.on("unhandledRejection", error => console.error("Unhandled promise rejection:", error));

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildVoiceStates,
  ],
});

// in any server, the dev bot only responds in channels with this name, and the prod bot only in
// channels with a different name
const BOT_TESTING_CHANNEL = "bot-testing";

const isListeningIn = (channel: GuildTextBasedChannel | null) => {
  const isBotTesting = channel?.name === BOT_TESTING_CHANNEL;
  return Config.IS_PROD ? !isBotTesting : isBotTesting;
};

client.once(Events.ClientReady, async clientReady => {
  try {
    const guild = await clientReady.guilds.fetch(Config.GUILD_ID);
    const commands = await guild.commands.set(Commands.map(command => command.data));
    // the ids are needed to render clickable command mentions
    setCommandIds(commands.values());
    const mode = Config.IS_PROD
      ? `production mode (responding everywhere except #${BOT_TESTING_CHANNEL})`
      : `development mode (only responding in #${BOT_TESTING_CHANNEL})`;
    console.log(`Logged in as ${clientReady.user.tag} in ${mode}!`);
  } catch (error) {
    console.error("Failed to register the slash commands:", error);
  }
});

client.on(Events.InteractionCreate, async interaction => {
  if (!interaction.inCachedGuild() || !isListeningIn(interaction.channel)) return;

  if (interaction.isChatInputCommand()) {
    try {
      const command = Commands.find(c => c.data.name === interaction.commandName);
      if (!command) throw new Error("Command not supported yet! Check back soon.");
      await command.execute(interaction);
    } catch (error) {
      await handleInteractionError(interaction, error);
    }
  } else if (interaction.isModalSubmit()) {
    try {
      if (interaction.customId === FEATURE_MODAL_ID) await postFeature(interaction);
    } catch (error) {
      await handleInteractionError(interaction, error);
    }
  }
});

client.on(Events.MessageCreate, async message => {
  if (!message.inGuild() || message.author.bot || !isListeningIn(message.channel)) return;
  try {
    if (message.channelId === Channels.adminAnnouncements) await postAdminAnnouncement(message);
    else await updateMessageEngagementMetrics(message);
  } catch (error) {
    await sendErrorToChannel(message.channel, error);
  }
});

client.on(Events.MessageReactionAdd, async (reaction, user) => {
  if (reaction.partial) return;
  const { message } = reaction;
  if (message.partial || !message.inGuild()) return;
  // reactions to one's own messages don't count (this also skips the bot's own game reactions)
  if (message.author.id === user.id || !isListeningIn(message.channel)) return;
  try {
    await handleReaction(reaction, message, user.id);
  } catch (error) {
    await sendErrorToChannel(message.channel, error);
  }
});

// keep the user records (usernames, avatars, etc) up to date, and create one for the new member
client.on(Events.GuildMemberAdd, async member => {
  try {
    await configureGuildUsers(member.guild);
  } catch (error) {
    console.error("Failed to sync users after a member joined:", error);
  }
});

// discord.js re-emits errors thrown by async event listeners as "error" events, which crash the
// bot if nothing is listening for them
client.on(Events.Error, error => console.error("Discord client error:", error));

client.login(Config.BOT_TOKEN);
