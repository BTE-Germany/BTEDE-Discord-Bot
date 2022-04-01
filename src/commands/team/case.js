const {
  MessageEmbed,
  Interaction,
  Client,
  CommandInteraction,
} = require("discord.js");
const Command = require("../../classes/Command.js");
const Bot = require("../../classes/Bot.js");

class CaseCommand extends Command {
  constructor(client) {
    super(client, {
      name: "case",
      description: "Looks up a case",
      userAvailable: false,
      options: [
        {
          name: "case-id",
          description: "The ID of the case to look up",
          type: 10,
          required: true,
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
    const options = interaction.options;
    const args = options.data;

    let caseId = args.find((x) => x.name === "case-id")?.value;
    if (!caseId)
      return this.error(interaction, "Please provide a valid case ID!");

    let _case = await client.schemas.case.findOne({ id: caseId });
    if (!_case) return this.error(interaction, "This case does not exist.");

    let colors = {
      warn: "YELLOW",
      mute: "ORANGE",
      ban: "RED",
    };

    let titles = {
      warn: "Warning",
      mute: "Mute",
      ban: "Ban",
      kick: "Kick",
    };

    let caseEmbed = new this.embed()
      .setTitle(
        `${_case.deleted ? ":x: " : ""}Case ${_case.id}: ${titles[_case.type]}`
      )
      .setColor(colors[_case.type])
      .setDescription(
        "📅 Date:\n" +
          (_case.end
            ? `- End: <t:${Math.round(_case.end / 1000)}:R> | <t:${Math.round(
                _case.end / 1000
              )}:f>\n\n- Given: <t:${Math.round(
                _case.timestamp / 1000
              )}:R> | <t:${Math.round(
                _case.timestamp / 1000
              )}:f>\n\n- Duration: \`${client.parseTime(
                _case.end - _case.timestamp
              )}\``
            : `- Given: <t:${Math.round(
                _case.timestamp / 1000
              )}:R> | <t:${Math.round(_case.timestamp / 1000)}:f>`)
      )
      .addFields([
        {
          name: "🚨 Moderator",
          value: `<@!${_case.mod}> (${_case.mod})`,
          inline: true,
        },
        {
          name: "💬 Reason",
          value: `||${_case.reason}||`,
          inline: true,
        },
        {
          name: "👤 User",
          value: `<@!${_case.user}> (${
            _case.usertag ? `${_case.usertag} | ` : ""
          }${_case.user})`,
          inline: true,
        },
      ]);

    return this.response(interaction, caseEmbed);
  }
}

module.exports = CaseCommand;
