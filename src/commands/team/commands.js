const {
  MessageEmbed,
  Interaction,
  Client,
  CommandInteraction,
} = require("discord.js");
const Command = require("../../classes/Command.js");
const Bot = require("../../classes/Bot.js");
const { writeFileSync, unlinkSync } = require("fs");
const InfoCommand = require("../../classes/InfoCommand.js");

class CommandsCommand extends Command {
  constructor(client) {
    super(client, {
      name: "commands",
      description: "Manages commands",
      userAvailable: false,
      staffDc: true,
      options: [
        {
          name: "add",
          type: 1,
          description: "Adds a command to the bot",
          options: [
            {
              name: "commandname",
              description: "The name of the command to add",
              type: 3,
              required: true,
            },
            {
              name: "english-title",
              description: "The english title of the command",
              type: 3,
              required: true,
            },
            {
              name: "english-decription",
              description: "The english description of the command",
              type: 3,
              required: true,
            },
            {
              name: "german-title",
              description: "The german description of the command",
              type: 3,
              required: true,
            },
            {
              name: "german-decription",
              description: "The german description of the command",
              type: 3,
              required: true,
            },
          ],
        },
        {
          name: "delete",
          type: 1,
          description: "Deletes a command",
          options: [
            {
              name: "commandname",
              type: 3,
              description: "The command to delete",
              required: true,
              autocomplete: true,
            },
          ],
        },
        {
          name: "edit",
          type: 1,
          description: "Edits the text displayed when a command is executed",
          options: [
            {
              name: "language",
              description: "The language of the text to edit",
              type: 3,
              required: true,
              choices: [
                {
                  name: "German",
                  value: "de",
                },
                {
                  name: "English",
                  value: "en",
                },
              ],
            },
            {
              name: "commandname",
              description: "The name of the command to edit the text of",
              type: 3,
              required: true,
              autocomplete: true,
            },
            {
              name: "type",
              description:
                "Digga keine ahnung wie ich das beschreiben soll sag eif ob title oder description",
              type: 3,
              required: true,
              choices: [
                {
                  name: "Title",
                  value: "t",
                },
                {
                  name: "Description",
                  value: "d",
                },
              ],
            },
            {
              name: "text",
              description: "The new text",
              type: 3,
              required: true,
            },
          ],
        },
      ],
    });
  }

  /**
   * @param {CommandInteraction} interaction
   * @param {Bot} client
   */

  async run(interaction, client) {
    const options = interaction.options;
    const args = options._hoistedOptions;

    console.log(args);

    if (options.getSubcommand() === "add") {
      let commandName = args.find((x) => x.name === "commandname")?.value;
      if (!commandName)
        return this.error(interaction, "Enter a valid command name.");
      if (!commandName.match(/^[A-Za-z0-9-]+$/gm))
        return this.error(
          interaction,
          "You can only use letters from `A-Z`, `a-z`, `0-9` and `-`!"
        );

      let titleEng = args.find((x) => x.name === "english-title")?.value;
      if (!titleEng)
        return this.error(interaction, "Enter a valid `english-title`.");

      let descEng = args.find((x) => x.name === "english-title")?.value;
      if (!descEng)
        return this.error(interaction, "Enter a valid `english-title`.");

      let titleDe = args.find((x) => x.name === "german-title")?.value;
      if (!titleDe)
        return this.error(interaction, "Enter a valid `german-title`.");

      let descDe = args.find((x) => x.name === "german-decription")?.value;
      if (!descDe)
        return this.error(interaction, "Enter a valid `german-decription`.");

      if (
        client.config.infoCommands[commandName] ||
        client.commands.get(commandName)
      )
        return this.error(
          interaction,
          `This command already exists! \`/${commadName}\``
        );

      try {
        writeFileSync(
          `./src/lang/en/${commandName}.json`,
          JSON.stringify({
            d: descEng,
            t: titleEng,
          })
        );

        writeFileSync(
          `./src/lang/de/${commandName}.json`,
          JSON.stringify({
            d: descDe,
            t: titleDe,
          })
        );

        client.config.infoCommands.push(commandName);
        writeFileSync(
          `./config/infoCommands.json`,
          JSON.stringify(client.config.infoCommands)
        );

        let commandAddEmbed = new this.embed()
          .setTitle(`Added: **/${commandName}**`)
          .setDescription(
            "The command has been added with the following textes:"
          )
          .addFields([
            {
              name: ":flag_us: " + titleEng,
              value: descEng,
              inline: true,
            },
            {
              name: ":flag_de: " + titleDe,
              value: descDe,
              inline: true,
            },
          ]);

        let command = new InfoCommand(client, commandName, titleEng);
        await command.initialize(client.config.guild);

        client.commands.set(commandName, command);

        return this.response(interaction, commandAddEmbed);
      } catch (error) {
        return this.error(
          interaction,
          `Ein Fehler ist aufgetreten:\`\`\`js\n${error}\`\`\``
        );
      }
    } else if (options.getSubcommand() === "delete") {
      let commandName = args.find((x) => x.name === "commandname")?.value;
      if (!client.commands.get(commandName))
        return this.error(interaction, "This command does not exist.");

      let command = client.commands.get(commandName);
      if (!command.isInfo)
        return this.error(interaction, "This command can not be deleted.");

      try {
        unlinkSync(`./src/lang/en/${commandName}.json`);
        unlinkSync(`./src/lang/de/${commandName}.json`);

        client.config.infoCommands = client.config.infoCommands.filter(
          (x) => x != commandName
        );
        writeFileSync(
          `./config/infoCommands.json`,
          JSON.stringify(client.config.infoCommands)
        );

        let guild =
          client.guilds.cache.get(client.config.guild) ||
          (await client.guilds
            .fetch(client.config.guild)
            .catch(client.Logger.error));
        if (!guild)
          return this.error(
            interaction,
            "Couldn't fetch Guild: commands.js:~146"
          );
        let guildCommands = await guild.commands
          .fetch()
          .catch(client.Logger.error);
        if (!guildCommands)
          return this.error(
            interaction,
            "Couldn't fetch Guild Commands: commands.js:~148"
          );
        let commandId = guildCommands.find((x) => x.name === commandName)?.id;
        if (!commandId)
          return this.error(
            interaction,
            "Couldn't fetch Command: commands.js:~150"
          );

        guild.commands.delete(commandId).catch((e) => {
          client.Logger.error(e);
          return this.error(
            interaction,
            "Couldn't delete Command: commands.js:~154"
          );
        });

        return this.response(interaction, `Deleted **/${commandName}**`);
      } catch (error) {
        return this.error(
          interaction,
          `Ein Fehler ist aufgetreten:\`\`\`js\n${error}\`\`\``
        );
      }
    } else if (options.getSubcommand() === "edit") {
      let lang = args.find((x) => x.name === "language")?.value;
      let command = args.find((x) => x.name === "commandname")?.value;
      let type = args.find((x) => x.name === "type")?.value;
      let text = args.find((x) => x.name === "text")?.value;

      if (!text) return this.error(interaction, "Please enter a new text.");
      if (!type)
        return this.error(
          interaction,
          "Please enter a valid type. (`title` or `description`)"
        );
      if (!command || !client.commands.find((x) => x.help.name === command))
        return this.error(interaction, "Please enter a valid command name.");
      if (!lang)
        return this.error(
          interaction,
          "Please enter a valid language (`en` or `de`)"
        );

      try {
        let langFile = require(`../../lang/${lang}/${command}.json`);
        if (!langFile)
          return this.error(
            interaction,
            `Couldn't find language file. ("\`../../lang/${lang}/${command}.json\`")`
          );

        if (!langFile[type] || typeof langFile[type] != "string")
          return this.error(interaction, "Invalid type.");

        if (typeof text != "string" || text.length < 15)
          return this.error(interaction, "Enter a valid text (String).");

        langFile[type] = text;
        writeFileSync(
          `./src/lang/${lang}/${command}.json`,
          JSON.stringify(langFile)
        );

        return await this.response(
          interaction,
          new this.embed()
            .setTitle("✅ Editing Text succesfull!")
            .setDescription(
              `The ${
                type === "d" ? "Description" : "Title"
              } of the /${command} command has beed changed.`
            )
            .addField("New Text:", "```%t```".replace("%t", text))
        );
      } catch (err) {
        client.Logger.error(err);
        return this.error(
          interaction,
          `Couldn't find language file. ("\`../../lang/${lang}/${command}.json\`")`
        );
      }
    }
  }

  queryHandler(query) {
    let queries = [];
    let commands = this.client.commands;
    let infoCommands = commands.filter((cmd) => cmd.isInfo === true);
    infoCommands = infoCommands.filter((cmd) => cmd.help.name.includes(query));

    infoCommands.forEach((command) => {
      queries.push({
        name: (
          "/" +
          command.help.name +
          " - " +
          command.help.description
        ).substr(0, 100),
        value: `${command.help.name}`,
      });
    });

    return queries;
  }
}

module.exports = CommandsCommand;
