const { REST, Routes } = require("discord.js");
const { loadConfig } = require("./config");
const logger = require("./logger");

const clearCommands = async () => {
  const { token, guildId } = loadConfig();
  const rest = new REST({ version: "10" }).setToken(token);

  try {
    const app = await rest.get(Routes.user());
    const appId = app.id;

    await rest.put(Routes.applicationCommands(appId), { body: [] });
    logger.info(`Deleted all global application commands for app ${appId}.`);

    if (guildId) {
      await rest.put(Routes.applicationGuildCommands(appId, guildId), { body: [] });
      logger.info(`Deleted all guild application commands for guild ${guildId}.`);
    }
  } catch (error) {
    logger.error("Failed to delete slash commands:", error);
    process.exitCode = 1;
  }
};

clearCommands();
