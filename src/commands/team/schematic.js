const {CommandInteraction, MessageAttachment} = require("discord.js");
const Command = require("../../classes/Command.js");
const axios = require("axios");
const Bot = require("../../classes/Bot.js");
const crypto = require("crypto");

class schematicCommand extends Command {
    constructor(client) {
        super(client, {
            name: "schematic", description: "Schematics command", userAvailable: false, options: [{
                name: "upload", description: "Uploads a schematic", type: 1, options: [{
                    name: "schematic",
                    description: "The schematic to upload",
                    type: 11,
                    required: true
                }, {
                    name: "comment",
                    description: "A comment you want to add to the message",
                    type: 3,
                    required: false
                }]
            }, {
                name: "list", description: "Lists all schematics on the given server", type: 1
            }, {
                name: "download", description: "Downloads a schematic", type: 1, options: [{
                    name: "schematic", description: "The schematic to download", type: 3, required: true
                }, {
                    name: "comment",
                    description: "A comment you want to add to the message",
                    type: 3,
                    required: false
                }]
            }, {
                name: "delete", description: "Deletes a schematic", type: 1, options: [{
                    name: "schematic", description: "The schematic to delete", type: 3, required: true
                }, {
                    name: "comment",
                    description: "A comment you want to add to the message",
                    type: 3,
                    required: false
                }]
            }
            ]
        });
    }

    /**
     *
     * @param {CommandInteraction} interaction
     * @param {Bot} client
     */

    async run(interaction, client) {
        function chunkify(dat, size) {
            var chunks = [];
            dat.reduce((chuckStr, word, i, a) => {
              var pageIndex = `--- Seite ${(chunks.length + 1)} --- \n \n`;
              if ((chuckStr.length + word.length + pageIndex.length) > size) {
                chunks.push(pageIndex + chuckStr);
                chuckStr = word;
              } else if (i === a.length - 1) {
                chunks.push(pageIndex + chuckStr + '\n' + word);
              } else {
                chuckStr += '\n' + word;
              }
              return chuckStr;
            }, '');
            return chunks;
          }

        if (interaction.options.getSubcommand() === "list") {
            await axios.get(`http://cloud.bte.ger:45655/api/schematics/list`).then((res) => {
                let dat = res.data
                    .filter(a => a.endsWith(".schematic") || a.endsWith(".schem"))
                    .map(a => a.replace(".schematic", "").replace(".schem", ""));
                let chunks = chunkify(dat, 1950);
                this.response(interaction, `Schematics on the server:`);
                chunks.forEach(chunk => {
                    return client.channels.cache.get(interaction.channelId).send({content: "```" + chunk + "```"});
                });
            }).catch((e) => {
                console.log(e.message);
                return this.error(interaction, `Failed to list schematics on the server!`);
            })
        }

        if (interaction.options.getSubcommand() === "upload") {
            const schemfile = await interaction.options._hoistedOptions.find((o) => o.name === "schematic").attachment;
            let comment = "";

            try { comment = await interaction.options._hoistedOptions.find((x) => x.name === "comment").value; } catch {}
            if (!schemfile) return this.error(interaction, "Please provide a valid schematic!");
            if (!(schemfile.name.endsWith(".schematic") || schemfile.name.endsWith(".schem"))) return this.error(interaction, "Please provide the schematic in the form of a schematic!");
            await axios.post("http://cloud.bte.ger:45655/api/schematics/upload", {
                "url": schemfile.url,
            }).then((res) => {
                this.response(interaction, `Successfully uploaded the schematic to the server as ${res.data.fileName}.schematic`);
                if(comment.length > 0 ) client.channels.cache.get(interaction.channelId).send({content: "Kommentar: " + comment});
                return;
            }).catch((e) => {
                console.log(e.message);
                return this.error(interaction, `Failed to upload the schematic to the server!`);
            })
        }

        if (interaction.options.getSubcommand() === "download") {
            const name = await interaction.options._hoistedOptions.find((x) => x.name === "schematic").value;
            let comment = "";

            try { comment = await interaction.options._hoistedOptions.find((x) => x.name === "comment").value; } catch {}
            await axios.get(`http://cloud.bte.ger:45655/api/schematics/download?name=${name}`, {responseType: "arraybuffer"})
                .then(async ({data: schem}) => {
                    let {data: filetype} = await axios.get(`http://cloud.bte.ger:45655/api/schematics/filetype?name=${name}`);
                    const attachment = new MessageAttachment(schem, name + filetype);
                    await interaction.editReply("Here you go!");
                    return client.channels.cache.get(interaction.channelId).send({content: "Kommentar: " + comment, files: [attachment]});
                })
                .catch(async (e) => {
                    await this.error(interaction, "Schematic not found");
                    return console.log(e);
                });
        }
        
        if (interaction.options.getSubcommand() === "delete") {
            const name = await interaction.options._hoistedOptions.find((x) => x.name === "schematic").value;
            let comment = "";

            try { comment = await interaction.options._hoistedOptions.find((x) => x.name === "comment").value; } catch {}
            await axios.post("http://cloud.bte.ger:45655/api/schematics/delete", {
                "name": name
            }).then((res) => {
                this.response(interaction, res.data.message);
                if(comment.length > 0 ) client.channels.cache.get(interaction.channelId).send({content: "Kommentar: " + comment});
                return;
            }).catch((e) => {
                console.log(e.message);
                return this.error(interaction, `Failed to delete the schematic from the server!`);
            })
        }
    }
}

module.exports = schematicCommand;
