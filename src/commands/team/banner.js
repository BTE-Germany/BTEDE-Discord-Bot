const { CommandInteraction } = require("discord.js");
const Command = require("../../classes/Command.js");
const axios = require("axios");

class bannerCommand extends Command {
  constructor(client) {
    super(client, {
      name: "banner",
      description: "Changes the guild banner",
      userAvailable: false,
      options: [
        {
          name: "image",
          description: "The image to set as the banner",
          type: 11,
          required: true
        },
      ],
    });
  }

  /**
   *
   * @param {CommandInteraction} interaction
   * @param {Bot} client
   */

  async run(interaction, client) {
    const guild = await client.guilds.cache.get(client.config.guild);
    const bannerFile = await interaction.options._hoistedOptions.find((o) => o.name === "image").attachment;
    if(!bannerFile) return this.error(interaction, "Please provide a valid image!");
    if(!bannerFile.contentType.startsWith("image")) return this.error(interaction, "Please provide the image in the form of an image!");

    const imagebuffer = (await axios.get(bannerFile.url, { responseType: "arraybuffer" })).data;
    await guild.setBanner(imagebuffer, `Banner changed by ${interaction.user.tag}`);
    return this.response(interaction, `Successfully set the banner to ${bannerFile.url}`);
  }
}

module.exports = bannerCommand;
