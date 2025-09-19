const { EmbedBuilder, Colors } = require("discord.js");
const Command = require("../../classes/Command.js");
const Bot = require("../../classes/Bot.js");
const googleSuggestions = require("../../functions/googleSuggestions.js");

class ConsiderCommand extends Command {
  constructor(client) {
    super(client, {
      name: "consider",
      description: "Considers a suggestion",
      userAvailable: false,
      options: [
        {
          name: "suggestion-id",
          description: "The ID of the Suggestion to consider",
          type: 10,
          required: true,
        },
        {
          name: "text",
          description: "text",
          type: 3,
          required: true,
        },
      ],
    });
  }

  /**
   *
   * @param {import("discord.js").CommandInteraction} interaction
   * @param {Bot} client
   */

  async run(interaction, client) {
    const options = interaction.options;
    const args = options.data;

    let suggestionId = args[0]?.value;
    let considerText = args[1]?.value;

    if (!suggestionId || !considerText) return;

    let suggestionDb = await this.client.schemas.suggestion.findOne({
      id: suggestionId,
      status: { $ne: "deleted" },
    });
    if (!suggestionDb)
      return this.error(
        interaction,
        `Es gibt keine Suggestion mit der ID \`${suggestionId}\`!`
      );

    let suggestionChannel =
      this.client.channels.cache.get(this.client.config.channels.suggestions) ||
      (await this.client.channels
        .fetch(client.config.channels.suggestions)
        .catch(this.Logger.error));
    if (!suggestionChannel)
      return this.error(
        interaction,
        "Der Suggestion Kanal konnte nicht geladen werden."
      );

    /**
     * @type {Message}
     */
    let suggestionMessage = await suggestionChannel.messages
      .fetch(suggestionDb.messageid)
      .catch(this.Logger.error);
    if (!suggestionMessage)
      return this.error(
        interaction,
        "Die Nachricht zu dieser Suggestion konnte nicht gefunden werden."
      );

    const suggEmbed = suggestionMessage.embeds[0] ?? {};

    const newSuggEmbed = new EmbedBuilder(suggEmbed)
      .setFields()
      .addFields({
        name: "Status:",
        value: `Consider (${considerText})\n~ ${interaction.user.tag}`,
        inline: false,
      })
      .setColor(Colors.Yellow);

    suggestionMessage.edit({ embeds: [newSuggEmbed] }).catch((e) => {
      client.Logger.error(e);
      return this.error(
        interaction,
        "Unknown error occurred. (`Wasn't able to fetch message`)"
      );
    });

    suggestionDb.status = "consider";
    suggestionDb.closed = new Date().getTime();
    await suggestionDb.save();

    let suggUser =
      client.users.cache.get(suggestionDb.userid) ||
      (await client.users
        .fetch(suggestionDb.userid)
        .catch(client.Logger.error));
    if (suggUser)
      suggUser
        .send({
          embeds: [
            new EmbedBuilder()
              .setDescription(
                `Your suggestion (\`${suggestionId}\`) in ${suggestionMessage.guild.name} was considered, you can find it [here](${suggestionMessage.url}).`
              )
              .setColor(Colors.Yellow),
          ],
        })
        .catch((e) => {});

    await googleSuggestions(
      client.config.spreadsheets.suggestions.id,
      client.config.spreadsheets.suggestions.range,
      client.config.spreadsheets.suggestions.sheetID,

      suggestionId,
      "consider",
      interaction.user.tag,
      considerText,
      suggUser?.username
    );

    return this.response(
      interaction,
      new this.embed().setDescription(
        `Suggestion ${suggestionId} was considered.`
      )
    );
  }
}

module.exports = ConsiderCommand;
