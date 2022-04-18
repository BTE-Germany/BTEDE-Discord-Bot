const {
  MessageEmbed,
  Interaction,
  Client,
  CommandInteraction,
} = require("discord.js");
const Command = require("../classes/Command.js");
const Bot = require("../classes/Bot.js");
const IDS = require("./activites.json");

const help = {
  content: "_ _",
  embeds: [
    {
      description: "Usage: /activites [activity]",
      color: 9174784,
      fields: [
        {
          name: "Help (this embed)",
          value: "ID: help",
          inline: true,
        },
        {
          name: "Watch Together",
          value: "ID: youtube",
          inline: true,
        },
        {
          name: "Poker Night",
          value: "ID: poker",
          inline: true,
        },
        {
          name: "Betrayal.io",
          value: "ID: betrayal",
          inline: true,
        },
        {
          name: "Fishington.io",
          value: "ID: fish",
          inline: true,
        },
        {
          name: "Chess In The Park",
          value: "ID: chess",
          inline: true,
        },
        {
          name: "Sketchy Artist",
          value: "ID: artist",
          inline: true,
        },
        {
          name: "ID: Awkword",
          value: "ID: awkword",
          inline: true,
        },
        {
          name: "Delete Me Calla",
          value: "ID: delete",
          inline: true,
        },
        {
          name: "Doodle Crew",
          value: "ID: doodle",
          inline: true,
        },
        {
          name: "Sketch Heads",
          value: "ID: sketch",
          inline: true,
        },
        {
          name: "Letter League",
          value: "ID: letter",
          inline: true,
        },
        {
          name: "Word Snacks",
          value: "ID: word",
          inline: true,
        },
        {
          name: "SpellCast",
          value: "ID: spell",
          inline: true,
        },
        {
          name: "Checkers In The Park",
          value: "ID: checkers",
          inline: true,
        },
        {
          name: "Blazing 8s",
          value: "ID: 8s",
          inline: true,
        },
        {
          name: "Putt Party",
          value: "ID: putt",
          inline: true,
        },
        {
          name: "Land-io",
          value: "ID: land",
          inline: true,
        },
      ],
      author: {
        name: "Activities",
        icon_url:
          "https://cdn.discordapp.com/emojis/853745991525859338.gif?size=96&quality=lossless",
      },
    },
  ],
  attachments: [],
  ephemeral: true,
};

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: "activity",
      description: "Start an activity in your voice channel",
      options: [
        {
          name: "activity",
          description: "The ID of the activity to start",
          type: 3,
          required: true,
        },
      ],
      userAvailable: true,
    });
  }

  /**
   *
   * @param {CommandInteraction} interaction
   * @param {Bot} client
   */

  async run(interaction, client) {
    if (!interaction.isCommand()) return;
    const options = interaction.options;
    const args = interaction.options.getString("activity");
    //check if user is in a voice channel
    if (args === "help") {
      this.response(interaction, help);
    }
    if (!interaction.message.member.voice.channel) {
      this.error(interaction,
        "You must be in a voice channel to use this command"
      );
    } else {
      if (!args) {
        this.error(interaction, "You must provide an activity ID");
      } else {
        try {
          client.channels.cache
            .get(
              interaction.guild.members.cache.get(interaction.user.id).voice
                .channel.id
            )
            .createInvite({
              targetType: 2,
              targetApplication: args,
            })
            .then((invite) =>
              this.response(interaction,
                `✅ | Invite created! Click here to start: ${invite.url}`
              )
            );
        } catch (error) {
          this.error(interaction,
            "An error occurred while creating the invite! Did you provide a valid activity ID?"
          );
        }
      }
    }
  }
};
