require("dotenv").config();

const loadConfig = () => {
  const token = process.env.DISCORD_BOT_TOKEN;
  const guildId = process.env.DISCORD_GUILD_ID;
  const targetChannelId = process.env.DISCORD_PROGRESS_CHANNEL_ID;
  const forumChannelId = process.env.DISCORD_PROGRESS_FORUM_ID;
  const mongoUri = process.env.MONGO_URI;

  if (!token) {
    throw new Error("Missing bot token. Set DISCORD_BOT_TOKEN.");
  }

  if (!targetChannelId) {
    throw new Error("Missing target channel. Set DISCORD_PROGRESS_CHANNEL_ID.");
  }

  if (!forumChannelId) {
    throw new Error("Missing forum channel configuration. Set DISCORD_PROGRESS_FORUM_ID.");
  }

  if (!mongoUri) {
    throw new Error("Missing database configuration. Set MONGO_URI.");
  }

  return { token, guildId, targetChannelId, forumChannelId, mongoUri };
};

module.exports = { loadConfig };
