const { ActivityType } = require("discord.js");
const BaseEvent = require("../classes/Event.js");
const Bot = require("../classes/Bot.js");
const MutesHandler = require("../handlers/Mutes.js");
const BansHandler = require("../handlers/Bans.js");

module.exports = class extends BaseEvent {
  constructor() {
    super("clientReady");
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
        c.send({ embeds: [ new EmbedBuilder()
            .setColor("#046cfc")
            .setTitle("Here you can select your region [Bundesland] and get a text channel for it:")
        ], components: [
            require("../structures/federalSelectRow.js")
        ], files: ["./image.png"]})*/

    client.commands.forEach((command) => {
      if (command.config.staffDc && client.config.staffDc?.id) {
        command.initialize(client.config.staffDc.id);
        return;
      }

      const targetGuild = client.config.guild || client.config.staffDc?.id;
      if (!targetGuild) {
        client.Logger.warn(
          `Skipping registration for /${command.help.name}: no guild configured.`
        );
        return;
      }

      command.initialize(targetGuild);
    });

    client.user.setPresence({
      activities: [{ name: "on BTE-Germany.de", type: ActivityType.Playing }],
      status: "online",
      afk: false,
    });
    let i = 0;
    const statusMessages = [
      { type: ActivityType.Listening, name: "/help" },
      { type: ActivityType.Playing, name: "on BTE-Germany.de" },
    ];
    setInterval(() => {
      client.user.setPresence({
        activities: [statusMessages[i] ?? statusMessages[0]],
        status: "online",
        afk: false,
      });
      i++;
      if (i === statusMessages.length) i = 0;
    }, 5 * 60 * 1000);

    MutesHandler(client);

    BansHandler(client);

  }
};


