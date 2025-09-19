const { ApplicationCommandOptionType, CommandInteraction } = require("discord.js");
const BaseCommand = require("./Command.js");
const Bot = require("./Bot.js");
const { default: axios } = require("axios");

const buildCmsBasePath = (client) => {
  const cmsConfig = client.config?.services?.cms ?? {};
  const baseUrl = cmsConfig.baseUrl.replace(/\/+$/, "");
  const segment = cmsConfig.botMessagesPath.startsWith("/") ? cmsConfig.botMessagesPath : `/${cmsConfig.botMessagesPath}`;
  return `${baseUrl}${segment}`;
};

module.exports = class InfoCommand extends BaseCommand {
  constructor(opts, name, desc) {
    super(opts, {
      name: name,
      userAvailable: true,
      description: desc,
      options: [
        {
          name: "language",
          description: "Language",
          type: ApplicationCommandOptionType.String,
          required: false,
          choices: [
            {
              name: "german",
              value: "de",
            },
            {
              name: "english",
              value: "en",
            },
          ],
        },
      ],
    });
  }

  /**
   *
   * @param {CommandInteraction} interaction
   * @param {Bot} client
   * @returns
   */

  async run(interaction, client) {
    const options = interaction.options;
    const args = options.data;
    let language = "de";
    if (args[0]?.value === "en" || args[0]?.value === "lang_en")
      language = "en";

    const cmsBasePath = buildCmsBasePath(client);
    const url = `${cmsBasePath}/${language}_${this.help.name}/`;
    let response = await axios({
      method: "get",
      url: url,
    }).catch((e) => {});

    let data = response?.data?.data || {
      title: "Error",
      message: "Couldn't load message data from backend.",
    };

    return await this.response(
      interaction,
      new this.embed().setDescription(data.message).setTitle(data.title)
    );
  }

  get isInfo() {
    return true;
  }
};
