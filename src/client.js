const { Client, GatewayIntentBits, Partials, Events } = require("discord.js");

const createDiscordClient = (targetChannelId) => {
  const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
    partials: [Partials.Channel, Partials.Message],
  });

  let targetChannel = null;

  const ensureTargetChannel = async () => {
    if (targetChannel) return targetChannel;
    try {
      const fetched = await client.channels.fetch(targetChannelId);
      if (fetched?.isTextBased()) {
        targetChannel = fetched;
        return targetChannel;
      }
      console.error(`Configured target channel ${targetChannelId} is not text-based or not accessible.`);
    } catch (error) {
      console.error(`Failed to fetch target channel ${targetChannelId}:`, error);
    }
    return null;
  };

  client.once(Events.ClientReady, async (readyClient) => {
    console.log(`Logged in as ${readyClient.user.tag}. Watching for new forum posts...`);
    await ensureTargetChannel();
  });

  return { client, ensureTargetChannel };
};

module.exports = { createDiscordClient };
