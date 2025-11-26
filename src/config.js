require("dotenv").config();

const loadConfig = () => {
  const token = process.env.DISCORD_BOT_TOKEN;
  const guildId = process.env.DISCORD_GUILD_ID;
  const targetChannelId = process.env.DISCORD_PROGRESS_CHANNEL_ID;
  const forumChannelId = process.env.DISCORD_PROGRESS_FORUM_ID;
  const mongoUri = process.env.MONGO_URI;
  const pruneDaysRaw = process.env.MONGO_REMOVE_AFTER_DAYS;
  const pruneDays = pruneDaysRaw !== undefined && pruneDaysRaw !== "" ? Number(pruneDaysRaw) : 0;

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

  if (Number.isNaN(pruneDays)) {
    throw new Error("MONGO_REMOVE_AFTER_DAYS must be a number (can be negative to delete all, 0 to disable).");
  }

  return { token, guildId, targetChannelId, forumChannelId, mongoUri, pruneDays };
};

module.exports = { loadConfig };
