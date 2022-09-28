const { CommandInteraction } = require("discord.js");
const Command = require("../../classes/Command.js");
const axios = require("axios");
const Bot = require("../../classes/Bot.js");
const crypto = require("crypto");

class schematicCommand extends Command {
  constructor(client) {
    super(client, {
      name: "schematic",
      description: "Uploads a schematic",
      userAvailable: false,
      options: [
        {
          name: "upload",
          description: "Uploads a schematic",
          type: 1,
          options: [
        {
          name: "schematic",
          description: "The schematic to upload",
          type: 11,
          required: true
        },
        {
          name: "terra",
          description: "The terraserver to upload to",
          type: 3,
          required: true,
          choices: client.config.status.map((s) => ({ name: s.id, value: s.id })),
        }
        ]},
        {
          name: "list",
          description: "Lists all schematics on the given server",
          type: 1,
          options: [
            {
              name: "terra",
              description: "The terraserver to list schematics from",
              type: 3,
              required: true,
              choices: client.config.status.map((s) => ({ name: s.id, value: s.id })),
            }
          ]
        }
      ],
    });
  }

  /**
   *
   * @param {CommandInteraction} interaction
   * @param {Bot} client
   */

  async run(interaction, client) {
    const terraname = await interaction.options._hoistedOptions.find((x) => x.name === "terra").value;

    if(interaction.options._hoistedOptions.find((x) => x.name === "upload" === undefined)) {
      await axios.get(`http://cloud.bte.ger:45655/api/schematics/list?terra=${terraname.replace(" ", "-")}`).then(
        (res) => {
          return this.response(interaction, `Schematics on ${terraname}: \n` + "```" + res.data.join("\n").toString().replace(".schematic", "") + "```");
        }
      ).catch(
        (e) => {
          console.log(e.message);
          return this.error(interaction, `Failed to list schematics on ${terraname}!`);
        }
      )
    }
      else {
      const schemfile = await interaction.options._hoistedOptions.find((o) => o.name === "schematic").attachment;

      if (!schemfile) return this.error(interaction, "Please provide a valid schematic!");
      if (!schemfile.name.endsWith(".schematic")) return this.error(interaction, "Please provide the schematic in the form of a schematic!");

      console.log(schemfile.url);
      await axios.post("http://cloud.bte.ger:45655/api/schematics/upload",
        {
          "url": schemfile.url,
          "terra": terraname.replace(" ", "-"),
        }
      ).then(
        (res) => {
          return this.response(interaction, `Successfully uploaded the schematic to ${res.data.server} as ${res.data.fileName}.schematic`);
        }
      ).catch(
        (e) => {
          console.log(e.message);
          return this.error(interaction, `Failed to upload the schematic to ${terraname}!`);
        }
      )
    }
    }
}

module.exports = schematicCommand;
