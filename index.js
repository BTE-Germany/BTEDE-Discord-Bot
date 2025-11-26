const { loadConfig } = require("./src/config");
const { connectDatabase, Crosspost, ThreadColor } = require("./src/db");
const { CrosspostStore } = require("./src/crosspostStore");
const { createDiscordClient } = require("./src/client");
const { registerHandlers } = require("./src/handlers");
const { ThreadColorStore } = require("./src/threadColorStore");
const logger = require("./src/logger");

const start = async () => {
  const config = loadConfig();

  await connectDatabase(config.mongoUri);

  const store = new CrosspostStore(Crosspost, config.targetChannelId);
  await store.load();
  await store.prune(config.pruneDays);

  const colorStore = new ThreadColorStore(ThreadColor);
  // no pruning needed for colors; they are deleted on thread removal or when crossposts are gone

  if (config.pruneDays !== 0) {
    const intervalMs = 12 * 60 * 60 * 1000;
    setInterval(async () => {
      try {
        await store.prune(config.pruneDays);
      } catch (error) {
        logger.error("Scheduled prune failed:", error);
      }
    }, intervalMs);
  }

  const { client, ensureTargetChannel } = createDiscordClient(config.targetChannelId);

  registerHandlers({
    client,
    config,
    ensureTargetChannel,
    store,
    colorStore,
  });

  await client.login(config.token);
};

start().catch((error) => {
  logger.error("Failed to start bot:", error);
  process.exit(1);
});
