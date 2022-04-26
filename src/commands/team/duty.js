const {
  MessageEmbed,
  Interaction,
  Client,
  CommandInteraction,
} = require("discord.js");
const Command = require("../../classes/Command.js");
const Bot = require("../../classes/Bot.js");

class WarnCommand extends Command {
  constructor(client) {
    super(client, {
      name: "duty",
      description: "Get a support duty.",
      userAvailable: false,
    });
  }

  /**
   *
   * @param {CommandInteraction} interaction
   * @param {Bot} client
   */

  async run(interaction, client) {
    const user = interaction.member;
    const guild = client.guilds.cache.get(client.config.guild);
    const member = guild.members.cache.get(user.id);

    if (!member.roles.cache.get(client.config.roles.support))
      return this.error("You are not a support member! You can't get on duty!");

    if (member.roles.cache.has(client.config.roles.duty)) {
      await member.roles.remove(client.config.roles.duty);
      return this.response(interaction, "You are now __not__ on duty!");
    } else {
      await member.roles.add(client.config.roles.duty);
      return this.response(interaction, "You are now __on duty__!");
    }
  }
}

module.exports = WarnCommand;
