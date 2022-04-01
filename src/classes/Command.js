const { MessageEmbed, CommandInteraction } = require("discord.js");
const fs = require("fs").promises;
const Bot = require("./Bot.js");

class BaseCommand {
  constructor(
    client,
    {
      description = "",
      name = "Beispiel Command",

      userAvailable = true,

      permissions = [
        {
          id: "700788505936396388", // mods // 700788505936396388
          type: "ROLE",
          permission: true,
        },
        {
          id: "552530299423293441", // qreepex
          type: "USER",
          permission: true,
        },
      ],

      staffDc = false,

      aliases = [],

      options = [],

      queries = [],
    }
  ) {
    /**
     * The {@link Bot} the Command belongs to.
     * @type {Bot}
     */
    this.client = client;

    this.config = { userAvailable, options, permissions, queries, staffDc };
    this.help = { name, description, aliases };
    this.Logger = client?.Logger;
  }

  get embed() {
    return class extends MessageEmbed {
      constructor(options) {
        super(options);
        (this.color = "#347aeb"),
          (this.timestamp = Date.now()),
          (this.footer = {
            text: "BTE Germany",
            iconURL:
              "https://cdn.discordapp.com/icons/692825222373703772/a_e643511c769fd27a0f361d01c23f2cee.gif?size=1024",
          });
      }
    };
  }

  /**
   *
   * @param {String} key
   * @returns
   */

  t(key) {
    let language = key.split("/")[0];
    let command = key.split("/")[1].split(":")[0];
    let text = key.split("/")[1].split(":")[1];
    return require(`../lang/${language}/${command}.json`)?.[text];
  }

  /**
   *
   * @param {CommandInteraction} interaction
   */

  async run(interaction) {
    this.Logger.warn(
      "Ended up in command.js [" + JSON.stringify(this.config) + "]"
    );
  }

  /**
   *
   * @param {String} query
   */

  async queryHandler(query) {
    this.Logger.warn(
      "Ended up in command.js [" + JSON.stringify(this.config) + "]"
    );
    return [];
  }

  /**
   *
   * @param {String} guildId
   */

  async initialize(guildId) {
    let guild = await this.client.guilds.fetch(guildId);

    if (this.config.userAvailable)
      this.config.permissions.push({
        id: this.client.config.roles.rules, // user (rules) // 709805597863968799
        type: "ROLE",
        permission: true,
      });

    if (guildId === "723944715346509854") {
      this.config.permissions.push({
        id: "849965829789450250",
        type: "ROLE",
        permission: true,
      });
    }

    guild.commands
      .create({
        name: this.help.name,
        description: this.help.description,
        defaultPermission: false,
        options: this.config.options,
      })
      .then((cmd) => {
        let perms = this.config.permissions;
        cmd.permissions
          .add({ command: cmd.id, permissions: perms })
          .then(() => {
            this.Logger.info(`Created /${this.help.name}`, "COMMANDS");
          });
      })
      .catch(this.client.Logger.error);
  }

  delete() {
    this.rest
      .applications(this.client.user.id)
      .guilds(this.client.config.guild)
      .commands.post({
        data: {
          name: this.help.name,
          description: this.help.description,
          options: this.config.options,
        },
      })
      .catch((e) => {
        console.log(e);
      });
  }

  /**
   *
   * @param {[MessageEmbed, String, Array]} input
   * @param {Array} components
   * @returns
   */

  async response(interaction, input, components = []) {
    if (typeof input === "object") {
      if (input.description)
        return await interaction
          .editReply({ embeds: [input], components: components })
          .catch(this.client.Logger.error);
      else
        return await interaction
          .editReply({ embeds: input, components: components })
          .catch(this.client.Logger.error);
    } else if (typeof input === "string") {
      return await interaction
        .editReply({ content: input, components: components })
        .catch(this.client.Logger.error);
    }
  }

  /**
   *
   * @param {String} text
   * @returns
   */

  error(interaction, text) {
    return interaction
      .editReply({
        embeds: [
          new MessageEmbed().setColor("#ff0000").setDescription(":x: " + text),
        ],
      })
      .catch(this.client.Logger.error);
  }

  get rest() {
    return this.client.api;
  }
}

module.exports = BaseCommand;
