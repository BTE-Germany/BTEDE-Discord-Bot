const { loadConfig } = require("./src/config");
const { connectDatabase, Crosspost } = require("./src/db");
const { CrosspostStore } = require("./src/crosspostStore");
const { createDiscordClient } = require("./src/client");
const { registerHandlers } = require("./src/handlers");
const { buildCrosspostPayload, getStarterMessage } = require("./src/payload");
const logger = require("./src/logger");

const start = async () => {
  const config = loadConfig();

  await connectDatabase(config.mongoUri);

  const store = new CrosspostStore(Crosspost, config.targetChannelId);
  await store.load();

  const { client, ensureTargetChannel } = createDiscordClient(config.targetChannelId);

  registerHandlers({
    client,
    config,
    ensureTargetChannel,
    store,
    buildCrosspostPayload,
    getStarterMessage,
  });

  await client.login(config.token);
};

start().catch((error) => {
  logger.error("Failed to start bot:", error);
  process.exit(1);
});
