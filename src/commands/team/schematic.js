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
    const terra = await client.config.status.find((x) => x.id === terraname);
    const name = crypto.randomUUID();
    const schemfile = await interaction.options._hoistedOptions.find((o) => o.name === "schematic").attachment;

    if(!schemfile) return this.error(interaction, "Please provide a valid schematic!");
    if(!schemfile.name.endsWith(".schematic")) return this.error(interaction, "Please provide the schematic in the form of a schematic!");
    await axios.post(
      terra.ip + ":" + terra.schemport + "/api/schematic",
      {
        name: name,
        url: schemfile.url
      }
    ).then(
      () => {
        this.response(interaction, `Successfully uploaded the schematic to ${terra.id} as ${name}.schematic`);
      }
    ).catch(
      (e) => {
        console.log(e.message);
        this.error(interaction, `Failed to upload the schematic to ${terra.id}!`);
      }
    )
  }
}

module.exports = schematicCommand;
