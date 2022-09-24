const {
  MessageEmbed,
  GuildMemberManager,
  GuildAuditLogs,
  MessageAttachment,
} = require("discord.js");
const BaseEvent = require("../classes/Event.js");
const Bot = require("../classes/Bot.js");
const { Util } = require("discord.js");
const InstagramHandler = require("../handlers/instagram.js");
const YoutubeHandler = require("../handlers/youtube.js");
const MutesHandler = require("../handlers/Mutes.js");
const BansHandler = require("../handlers/Bans.js");

module.exports = class extends BaseEvent {
  constructor() {
    super("ready");
  }

  /**
   *
   * @param {Bot} client
   */

  async run(client) {
    client.Logger.info(
      `Logged in at ${new Date().toLocaleString().replace(",", "")} as ${
        client.user.tag
      } [${client.user.id}]`,
      "CLIENT"
    );

    /*  let c = client.channels.cache.get("705110368200032297");
        c.send({ embeds: [ new MessageEmbed()
            .setColor("#046cfc")
            .setTitle("Here you can select your region [Bundesland] and get a text channel for it:")
        ], components: [
            require("../structures/federalSelectRow.js")
        ], files: ["./image.png"]})*/

    client.commands.forEach((command) => {
      if (command.config.staffDc) {
        command.initialize(client.config.staffDc.id);
        return;
      }

      command.initialize(client.config.guild);
    });

    client.user.setPresence({
      activities: [{ name: "on BTE-Germany.de", type: "PLAYING" }],
      status: "online",
      afK: false,
    });
    let i = 0;
    let statusMessages = [
      "LISTENING_to /help",
      "PLAYING_on ServerBlaze.eu",
      "PLAYING_on BTE-Germany.de",
    ];
    setInterval(() => {
      client.user.setPresence({
        activities: [
          {
            name: statusMessages[i]?.split("_")[1],
            type: statusMessages[i]?.split("_")[0],
          },
        ],
        status: "online",
        afK: false,
      });
      i++;
      if (i === statusMessages.length) i = 0;
    }, 5 * 60 * 1000);

    MutesHandler(client);

    BansHandler(client);

    YoutubeHandler(client);

    let currentDate = new Date();

    let nextDate = new Date(
      new Date().setHours(
        currentDate.getHours() % 2 === 0
          ? currentDate.getHours() + 2
          : currentDate.getHours() + 1,
        0,
        0,
        0
      )
    );

    let timeout = nextDate.getTime() - currentDate.getTime();
    client.Logger.info("Started waiting", "Instagram");

    setTimeout(() => {
      setInterval(() => {
        InstagramHandler(client);
      }, 2 * 60 * 60 * 1000);
    }, timeout);
  }
};
