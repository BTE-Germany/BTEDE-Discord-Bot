const { CommandInteraction } = require("discord.js");
const Command = require("../../classes/Command.js");
const Bot = require("../../classes/Bot.js");
const { writeFileSync } = require("fs");

class WelcomeCommand extends Command {
  constructor(client) {
    super(client, {
      name: "welcome",
      description: "Disables / Enables welcome messages for the server.",
      userAvailable: false,
      staffDc: true,
    });
  }

  /**
   *
   * @param {CommandInteraction} interaction
   * @param {Bot} client
   */

  async run(interaction, client) {
    client.config.welcomeMessage = client.config.welcomeMessage ? false : true;

    writeFileSync(
      "./config/welcomeMessage.json",
      JSON.stringify(client.config.welcomeMessage)
    );

    return this.response(
      interaction,
      `:white_check_mark: **Welcome Messages:** \`${
        client.config.welcomeMessage ? "Enabled" : "Disabled"
      }\``
    );
  }
}

module.exports = WelcomeCommand;
