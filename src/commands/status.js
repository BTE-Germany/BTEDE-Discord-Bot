const {
  MessageEmbed,
  Interaction,
  Client,
  CommandInteraction,
} = require("discord.js");
const Command = require("../classes/Command.js");
const util = require("minecraft-server-util");
const Bot = require("../classes/Bot.js");

class StatusCommand extends Command {
  constructor(client) {
    super(client, {
      name: "status",
      description: "Shows the status of the server",
      aliases: ["serverstatus", "server-status"],
      userAvailable: true,
    });
  }

  /**
   *
   * @param {CommandInteraction} interaction
   * @param {Bot} client
   */

  async run(interaction, client) {
    const options = interaction.options;
    const args = options._hoistedOptions;

    const ips = client.config.status;

    var status = [];

    async function genStatus() {
      var status = [];
      for (let server in ips) {
        let res = await getStatus(ips, server);
        status.push(res);
      }

      return status;
    }

    status = await genStatus();
    status = status.sort((a, b) => (a.id > b.id ? 1 : -1));

    let replyEmbed = new this.embed()
      .setTitle(`Server Status`)
      .setColor("#347aeb");

    status.forEach((server) => {
      replyEmbed.setDescription(
        `${
          replyEmbed.description ? replyEmbed.description + "\n\n" : ""
        }**<:server:833377668057006080> ${server.id} (${server.player})**: ${
          server.status
        }`
      );
    });

    return await this.response(interaction, replyEmbed);
  }
}

async function getStatus(ips, server) {
  var res = await util
    .status(ips[server].ip, { port: ips[server].port })
    .catch(() => {
      return {
        id: ips[server].id,
        status: "offline :red_circle:",
        player: 0,
      };
    });

  if (!res.rawResponse)
    return {
      id: ips[server].id,
      status: "offline :red_circle:",
      player: 0,
    };

  return {
    id: ips[server].id,
    status: "online :green_circle:",
    player: res.rawResponse.players.online,
  };
}

module.exports = StatusCommand;
