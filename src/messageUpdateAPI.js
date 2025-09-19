const express = require("express");
const { default: axios } = require("axios");
const { EmbedBuilder } = require("discord.js");

const buildCmsUrl = (base, subPath) => {
  const normalizedBase = (base || "").replace(/\/+$/, "");
  const segment = subPath ? (subPath.startsWith("/") ? subPath : `/${subPath}`) : "";
  return `${normalizedBase}${segment}`;
};

module.exports = (client) => {
  const app = express();

  app.use(express.json());
  app.use(
    express.urlencoded({
      extended: true,
    })
  );

  app.post("/messageUpdate", async (req, res) => {
    const key = req?.body?.keys?.[0];
    if (!key) {
      res.status(400).send("Missing key");
      return;
    }

    const cmsConfig = client.config?.services?.cms ?? {};
    const channelMessagesUrl = `${buildCmsUrl(
      cmsConfig.baseUrl || "https://cms.bte-germany.de",
      cmsConfig.channelMessagesPath || "/items/channelmessages"
    )}/${key}`;

    let data;
    try {
      data = await axios.get(channelMessagesUrl);
    } catch (error) {
      client.Logger.warn(`Failed to load message update payload: ${error.message}`);
      res.status(502).send("Upstream error");
      return;
    }

    if (!data || !data.data || !data.data.data) {
      res.status(404).send("Message data not found");
      return;
    }

    const channelId = data.data.data.channelId;
    const messageId = data.data.data.messageId;

    const channel = await client.channels.fetch(channelId).catch((e) => {
      client.Logger.warn(`Failed to fetch channel ${channelId}: ${e.message}`);
    });
    if (!channel) {
      res.status(404).send("Channel not found");
      return;
    }

    const message = await channel.messages.fetch(messageId).catch((e) => {
      client.Logger.warn(`Failed to fetch message ${messageId}: ${e.message}`);
    });
    if (!message) {
      res.status(404).send("Message not found");
      return;
    }

    const embedData = data.data.data.content;

    await message.edit({ embeds: [new EmbedBuilder(embedData)] }).catch((e) => {
      client.Logger.warn(`Failed to edit message ${messageId}: ${e.message}`);
    });

    res.sendStatus(204);
  });

  app.listen(18769, () =>
    client.Logger.info(`Started messageUpdateAPI on port 18769`, "API")
  );
};

