(async function () {

  const { GatewayIntentBits, Partials } = require("discord.js");
  const Bot = require("./src/classes/Bot");

  const client = new Bot({
    partials: [Partials.Message, Partials.Channel, Partials.GuildMember],
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.GuildMembers,
      GatewayIntentBits.GuildVoiceStates,
      GatewayIntentBits.DirectMessages,
    ],
  });

  const mongoose = require("mongoose");
  if (client.config?.mongo?.string) {
    try {
      client.connection = await mongoose.connect(client.config.mongo.string);
      client.Logger.info("Connected to MongoDB", "DATABASE");
    } catch (error) {
      client.Logger.error(`Failed to connect to MongoDB: ${error.message}`);
    }
  } else {
    client.Logger.warn("Skipping MongoDB connection - no connection string configured.");
  }

  const {
    registerEvents,
    registerCommands,
    registerInfoCommands,
  } = require("./src/functions/register");
  await registerEvents(client, "../events");
  await registerCommands(client, "../commands");
  await registerInfoCommands(client);
  client.Logger.info(`Registered ${client.commands.size} commands`, "COMMANDS");

  if (!client.config?.BOT_TOKEN) {
    throw new Error("Discord bot token is missing. Set DISCORD_BOT_TOKEN or update the config.");
  }

  await client.login(client.config.BOT_TOKEN);

  require("./src/messageUpdateAPI.js")(client);
})();
