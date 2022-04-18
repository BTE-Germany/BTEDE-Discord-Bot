const {
    MessageEmbed,
    Interaction,
    Client,
    CommandInteraction,
  } = require("discord.js");
  const Command = require("../classes/Command.js");
  const Bot = require("../classes/Bot.js");
  const IDS = require("./activites.json");
  
  const help = new MessageEmbed()
    .setColor("#0099ff")
    .setTitle("Activity")
    .setDescription("Usage: '/activity <activity>'")
    .addFields(
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
        name: "Awkword",
        value: "ID: awkword",
        inline: true,
      },
      {
        name: "Delete Me Calla",
        value: "ID: delete",
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
      }
    );
  
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
        return this.response(interaction, help);
      }
      if (!interaction.member.voice.channel) {
        this.error(
          interaction,
          "You must be in a voice channel to use this command"
        );
      } else {
        if (!args || !IDS[args]) {
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
                targetApplication: IDS[args],
              })
              .then((invite) =>
                this.response(
                  interaction,
                  `✅ | Invite created! Click here to start: ${invite.url}`
                )
              );
          } catch (error) {
            this.error(
              interaction,
              "An error occurred while creating the invite! Did you provide a valid activity ID?"
            );
          }
        }
      }
    }
  };
