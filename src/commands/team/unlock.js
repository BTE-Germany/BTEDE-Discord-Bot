const { Colors } = require("discord.js");
const Command = require("../../classes/Command.js");
const Bot = require("../../classes/Bot.js");

class LockCommand extends Command {
  constructor(client) {
    super(client, {
      name: "unlock",
      description: "Unlocks a channel",
      userAvailable: false,
      staffDc: false,
      options: [
        {
          name: "channel",
          type: 7,
          description: "The channel to unlock",
          required: false,
          channel_types: [0, 5, 10, 11, 12],
        },
      ],
    });
  }

  /**
   * @param {import("discord.js").CommandInteraction} interaction
   * @param {Bot} client
   */

  async run(interaction, client) {
    const options = interaction.options;
    const args = options._hoistedOptions;

    let channel =
      args.find((x) => x.name === "channel")?.channel || interaction.channel;
    let mod = interaction.user;

    if (channel.permissionsFor(client.config.roles.rules).has("SEND_MESSAGES"))
      return this.error(interaction, "The channel is not locked.");

    channel.permissionOverwrites
      .edit(
        client.config.roles.rules,
        {
          SEND_MESSAGES: true,
        },
        { reason: `Channel unlocked by ${mod.tag} | ${mod.id}` }
      )
      .then(async (editedChannel) => {
        let modlog =
          client.channels.cache.get(client.config.channels.modlog) ||
          (await client.channels
            .fetch(client.config.channels.modlog)
            .catch(client.Logger.warn));
        if (modlog) {
          modlog.send({
            embeds: [
              new this.embed()
                .setTitle(`🔓 Channel Unlocked`)
                .setColor(Colors.Green)
                .addFields([
                  {
                    name: "**🚨 Moderator**",
                    value: `${mod.tag} (${mod.id})`,
                    inline: true,
                  },
                  {
                    name: "**💬 Channel**",
                    value: `<#${editedChannel.id}> (\`#${editedChannel.name}\`)`,
                    inline: true,
                  },
                ]),
            ],
          });
        }

        return this.response(
          interaction,
          new this.embed().setDescription(
            `**🔓 <#${editedChannel.id}> has been unlocked.**`
          )
        );
      })
      .catch((e) => {
        client.Logger.error(e);
        return this.error(
          interaction,
          "An unknown error occurred. Contact Devs."
        );
      });
  }
}

module.exports = LockCommand;
