const {
  MessageEmbed,
  Interaction,
  Client,
  CommandInteraction,
} = require("discord.js");
const Command = require("../../classes/Command.js");
const Bot = require("../../classes/Bot.js");

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: "changelog",
      description: "Creates a changelog",
      userAvailable: false,
      options: [
        {
          name: "channel",
          type: 7,
          channel_types: [0, 5, 10, 11, 12],
          description: "The channel to send the changelog to",
          required: true,
        },
        {
          name: "title",
          type: 3,
          description: "The title",
          required: true,
        },
        {
          name: "subtitle1",
          type: 3,
          description: "The 1st subtitle",
          required: true,
        },
        {
          name: "content1",
          type: 3,
          description: "The 1st content",
          required: true,
        },
        {
          name: "subtitle2",
          type: 3,
          description: "The 2nd subtitle",
          required: false,
        },
        {
          name: "content2",
          type: 3,
          description: "The 2nd content",
          required: false,
        },
        {
          name: "subtitle3",
          type: 3,
          description: "The 3rd subtitle",
          required: false,
        },
        {
          name: "content3",
          type: 3,
          description: "The 3rd content",
          required: false,
        },
        {
          name: "subtitle4",
          type: 3,
          description: "The 4th subtitle",
          required: false,
        },
        {
          name: "content4",
          type: 3,
          description: "The 4th content",
          required: false,
        },
        {
          name: "subtitle5",
          type: 3,
          description: "The 5th subtitle",
          required: false,
        },
        {
          name: "content5",
          type: 3,
          description: "The 5th content",
          required: false,
        },
        {
          name: "subtitle6",
          type: 3,
          description: "The 6th subtitle",
          required: false,
        },
        {
          name: "content6",
          type: 3,
          description: "The 6th content",
          required: false,
        },
        {
          name: "subtitle7",
          type: 3,
          description: "The 7th subtitle",
          required: false,
        },
        {
          name: "content7",
          type: 3,
          description: "The 7th content",
          required: false,
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

    const channel = args.find((arg) => arg.name === "channel").channel;

    let title = args.find((arg) => arg.name === "title").value;

    let subArgs = args
      .filter((arg) => arg.name != "title")
      .filter((arg) => arg.name != "channel");

    let changelogEmbed = new this.embed().setTitle(title);

    let errorMsgs = [];

    subArgs.forEach((subArg) => {
      if (subArg.name.startsWith("subtitle")) {
        let subNumber = subArg.name.split("subtitle")[1];
        let subText = subArgs.find(
          (textArg) => textArg.name === `content${subNumber}`
        );
        subArgs = subArgs.filter((fArg) => fArg.name != `content${subNumber}`);
        subArgs = subArgs.filter((fArg) => fArg.name != `subtitle${subNumber}`);
        if (!subText)
          return errorMsgs.push(
            `**Titel ${subNumber}** hat keinen dazugehörigen Text und wurde deshalb nicht in das Embed aufgenommen. (\`${subArg.value}\`)`
          );
        changelogEmbed.addField(
          subArg.value.substr(0, 32),
          subText.value.substr(0, 1024),
          false
        );
      }
    });

    setTimeout(() => {
      subArgs.forEach((subArg) => {
        errorMsgs.push(
          `**Content ${
            subArg.name.split("content")[1]
          }** hat keinen dazugehörigen Titel**und wurde deshalb nicht in das Embed aufgenommen. (\`${
            subArg.value
          }\`)`
        );
      });
    }, 150);

    setTimeout(async () => {
      channel.send({ embeds: [changelogEmbed] }).catch((e) => {
        return this.error(
          `Can't send messages to <#${channel.id}>. Error: \`\`\`js\n${e}\`\`\``
        );
      });

      let embeds = [
        new MessageEmbed()
          .setColor("GREEN")
          .setDescription("✅ Embed sent succesfully."),
      ];

      if (errorMsgs.length != 0)
        embeds.push(
          new MessageEmbed()
            .setColor("#ff0000")
            .setDescription(":x: " + errorMsgs.join("\n\n:x: "))
        );
      await this.response(interaction, embeds);
    }, 500);
  }
};
