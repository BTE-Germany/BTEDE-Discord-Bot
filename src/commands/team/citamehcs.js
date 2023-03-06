const {CommandInteraction, MessageAttachment} = require("discord.js");
const Command = require("../../classes/Command.js");
const axios = require("axios");
const Bot = require("../../classes/Bot.js");

class citamehcsCommand extends Command {
    constructor(client) {
        super(client, {
            name: "citamehcs", description: "Downloads a schematic", userAvailable: false, options: [{
                name: "schematic", description: "The schematic to download", type: 3, required: true
            }, {
                name: "terra",
                description: "The terraserver to upload to",
                type: 3,
                required: true,
                choices: client.config.status.map((s) => ({name: s.id, value: s.id})),
            }],
        });
    }

    /**
     *
     * @param {CommandInteraction} interaction
     * @param {Bot} client
     */

    async run(interaction, client) {
        const terraname = await interaction.options._hoistedOptions.find((x) => x.name === "terra").value;
        const name = await interaction.options._hoistedOptions.find((x) => x.name === "schematic").value;

        await axios.get(`http://cloud.bte.ger:45655/api/schematics/download?terra=${terraname.replace(" ", "-")}&name=${name}`, {responseType: "arraybuffer"})
            .then(async ({data: schem}) => {
                const attachment = new MessageAttachment(schem, name + '.schematic');
                await interaction.editReply("!og uoy ereH");
                return client.channels.cache.get(interaction.channelId).send({content: null, files: [attachment]});
            })
            .catch(async (e) => {
                await this.error(interaction, "Schematic not found");
                return console.log(e);
            })
    }
}

module.exports = citamehcsCommand;
