const express = require("express");
const { default: axios } = require("axios");
const { MessageEmbed } = require("discord.js");
const bodyParser = require("body-parser");

module.exports = (client) => {
  const app = express();

  app.use(bodyParser.json());
  app.use(
    bodyParser.urlencoded({
      extended: true,
    })
  );

  app.post("/messageUpdate", async (req, res) => {
    console.log("request");
    let key = req?.body?.keys?.[0];
    if (!key) return console.log(4);

    let data = await axios.get(
      `https://cms.bte-germany.de/items/channelmessages/${key}`
    );
    if (!data || !data.data || !data.data.data) return console.log(5);

    let channelId = data.data.data.channelId;
    let messageId = data.data.data.messageId;

    let channel = await client.channels.fetch(channelId).catch((e) => {
      console.log(e);
    });
    if (!channel) return console.log(2);

    let message = await channel.messages.fetch(messageId).catch((e) => {
      console.log(e);
    });
    if (!message) return console.log(3);

    let embedData = data.data.data.content;

    await message.edit({ embeds: [new MessageEmbed(embedData)] }).catch((e) => {
      console.log(e);
    });
  });

  app.listen(18769, client.Logger.info(`Started messageUpdateAPI`, "API"));
};
