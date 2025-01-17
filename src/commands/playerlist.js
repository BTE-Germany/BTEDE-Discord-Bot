const {
  MessageEmbed,
  Interaction,
  Client,
  CommandInteraction,
  Util,
} = require("discord.js");
const Command = require("../classes/Command.js");
const util = require("minecraft-server-util");
const Bot = require("../classes/Bot.js");

class PlayerListCommand extends Command {
  constructor(client) {
    super(client, {
      name: "playerlist",
      description: "Shows the players currently building on the server",
      aliases: ["players", "list"],
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
        if (res) status.push(res);
      }

      return status;
    }

    status = await genStatus();
    status = status.sort((a, b) => (a.id > b.id ? 1 : -1));

    let replyEmbed = new this.embed()
      .setTitle(`Player List`)
      .setColor("#347aeb");

    if (status != null && status.length >= 0) {
      status.forEach((server) => {
        replyEmbed.setDescription(
            `${
                replyEmbed.description ? replyEmbed.description + "\n\n" : ""
            }**<:server:833377668057006080> ${server.id} (${server.player})**:\n${
                server.status
            }`
        );
      });
    } else {
      replyEmbed.setDescription(`Derzeit keine Builder aktiv.`);
    }

    return await this.response(interaction, replyEmbed);
  }
}

async function getStatus(ips, server) {
  var res = await util
    .status(ips[server].ip, { port: ips[server].port })
    .catch(() => {});

  let s = ``;
  res.samplePlayers?.forEach(
    (p) =>
      (s = `${s}${s.length === 0 ? "" : ", "}${Util.escapeMarkdown(p.name)}`)
  );

  if (s.length != 0) {
    return {
      id: ips[server].id,
      status: s,
      player: res.rawResponse.players.online,
    };
  } else {
    return null;
  }
}

module.exports = PlayerListCommand;
