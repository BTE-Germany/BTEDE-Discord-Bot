const {
  MessageEmbed,
  Interaction,
  Client,
  CommandInteraction,
} = require("discord.js");
const Command = require("../classes/Command.js");
const Bot = require("../classes/Bot.js");

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: "gif",
      description: "Useful GIF's",
      options: [
        {
          name: "gif",
          description: "The name of the GIF to send.",
          type: 3,
          required: true,
          choices: [
            {
              name: "tpll",
              value: "tpll",
            },
            {
              name: "install",
              value: "install",
            },
            {
              name: "measure",
              value: "measure",
            },
          ],
        },
      ],
      aliases: ["installgif", "install", "howtoinstall", "installationgif"],
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
    let gif = args[0].value;
    let gifLink = "";

    if (gif === "tpll") {
      gifLink = "https://gfycat.com/jitteryterrificchimpanzee";
    } else if (gif === "install") {
      gifLink = "https://imgur.com/9Arqjau";
    } else if (gif === "measure") {
      gifLink = "https://gyazo.com/d58446cec35cc504bb36b749346041a9";
    }

    return await this.response(interaction, gifLink);
  }
};
