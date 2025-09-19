const Command = require("../classes/Command.js");
const Bot = require("../classes/Bot.js");

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: "help",
      description: "List all commands",
      options: [
        {
          name: "command",
          description: "The command to send help for.",
          type: 3,
          required: false,
          autocomplete: true,
        },
      ],
      aliases: ["hilfe"],
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
    const args = options.data;

    if (args.length === 0) {
      let helpDesc = "";
      client.commands.forEach((command) => {
        helpDesc = `${helpDesc}**/${command.help.name}**\n${command.help.description}\n\n`;
      });
      let helpEmbed = new this.embed().setDescription(helpDesc);

      return await this.response(interaction, helpEmbed);
    } else if (args[0]) {
      let query = args[0].value.split("__")[0];
      let command = client.commands.get(query);
      if (!command) return this.error("This command was not found.");

      let cmdHelpEmbed = new this.embed()
        .setTitle("/" + command.help.name)
        .setDescription(command.help.description);

      return await this.response(interaction, cmdHelpEmbed);
    }
  }

  queryHandler(query) {
    let queries = [];
    let commands = this.client.commands;

    commands.forEach((command) => {
      if (command.help.name.includes(query))
        queries.push({
          name: (
            "/" +
            command.help.name +
            " - " +
            command.help.description
          ).substr(0, 100),
          value: `${command.help.name}__${command.help.name}`,
        });
      else {
        command.help.aliases.forEach((alias) => {
          if (alias.includes(query)) {
            let alr = queries.find((q) =>
              q.name.startsWith("/" + command.help.name)
            );
            if (!alr)
              queries.push({
                name: (
                  "/" +
                  command.help.name +
                  " - " +
                  command.help.description
                ).substr(0, 100),
                value: `${command.help.name}__${command.help.name}`,
              });
          } else {
            let alr = queries.find((q) =>
              q.name.startsWith("/" + command.help.name)
            );
            if (!alr)
              queries.push({
                name: (
                  "/" +
                  command.help.name +
                  " - " +
                  command.help.description
                ).substr(0, 100),
                value:
                  `${command.help.name}__${command.help.description}`.substr(
                    0,
                    100
                  ),
              });
          }
        });
      }
    });

    return queries;
  }
};
