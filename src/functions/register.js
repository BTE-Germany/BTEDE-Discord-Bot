const axios = require("axios");
const path = require("path"),
  fs = require("fs").promises,
  BaseEvent = require("../classes/Event.js"),
  BaseCommand = require("../classes/Command.js"),
  Bot = require("../classes/Bot.js");

const buildCmsUrl = (base, subPath = "") => {
  const normalizedBase = (base || "").replace(/\/+$/, "");
  const segment = subPath ? (subPath.startsWith("/") ? subPath : `/${subPath}`) : "";
  return `${normalizedBase}${segment}`;
};

/**
 *
 * @param {Bot} client
 * @param {String} dir
 */
async function registerEvents(client, dir = "") {
  const filePath = path.join(__dirname, dir);
  const files = await fs.readdir(filePath);
  for (const file of files) {
    const stat = await fs.lstat(path.join(filePath, file));
    if (stat.isDirectory()) await registerEvents(client, path.join(dir, file));
    if (file.endsWith(".js")) {
      const Event = require(path.join(filePath, file));
      if (Event.prototype instanceof BaseEvent) {
        const event = new Event();
        const handler = event.run.bind(event, client);
        if (event.name === "clientReady") {
          client.once(event.name, handler);
        } else {
          client.on(event.name, handler);
        }
      }
    }
  }
}

/**
 *
 * @param {Bot} client
 * @param {String} dir
 * @returns {Collection}
 */
async function registerCommands(client, dir = "") {
  const filePath = path.join(__dirname, dir);
  const files = await fs.readdir(filePath);
  for (const file of files) {
    const stat = await fs.lstat(path.join(filePath, file));
    if (stat.isDirectory()) await registerCommands(client, path.join(dir, file));
    if (file.endsWith(".js")) {
      const Command = require(path.join(filePath, file));
      if (Command.prototype instanceof BaseCommand) {
        const cmd = new Command(client);
        if (!cmd.config)
          return client.Logger.error(`${cmd.help.name} has no config`);
        client.commands.set(cmd.help.name, cmd);
      }
    }
  }
}

/**
 *
 * @param {Bot} client
 */
async function registerInfoCommands(client) {
  const InfoCommand = require("../classes/InfoCommand.js");
  const cmsConfig = client.config?.services?.cms ?? {};
  const rootEndpoint = buildCmsUrl(cmsConfig.baseUrl, cmsConfig.botMessagesPath);

  let slugs = [];
  try {
    const response = await axios.get(`${rootEndpoint}?fields=slug&limit=500`);
    const records = response?.data?.data;
    if (Array.isArray(records)) {
      slugs = records
        .map((record) => record?.slug)
        .filter((slug) => typeof slug === "string" && slug.trim().length > 0);
    }
  } catch (error) {
    client.Logger.warn(`Failed to load info command list: ${error.message}`);
    return;
  }

  if (!slugs.length) return;

  const requests = slugs.map(async (infoCommand) => {
    try {
      const url = `${rootEndpoint}/en_${infoCommand}/`;
      const response = await axios.get(url);
      const title = response?.data?.data?.title || infoCommand;
      const command = new InfoCommand(client, infoCommand, title);
      client.commands.set(command.help.name, command);
    } catch (error) {
      client.Logger.warn(
        `Failed to register info command ${infoCommand}: ${error.message}`
      );
    }
  });

  await Promise.all(requests);
}

module.exports = { registerCommands, registerEvents, registerInfoCommands };
