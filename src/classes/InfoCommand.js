const { MessageEmbed, CommandInteraction } = require("discord.js");
const BaseCommand = require("./Command.js")
const Bot = require("./Bot.js")

module.exports = class InfoCommand extends BaseCommand {
    constructor(opts, name, desc) {
        super(opts, {
            name: name,
            userAvailable: true,
            description: desc,
            options: [
                {
                    name: "language",
                    description: "Language",
                    type: 3,
                    required: false,
                    choices: [
                        {
                            name: "german",
                            value: "de"
                        },
                        {
                            name: "english",
                            value: "en"
                        },
                    ]
                }
            ]
        });
    }

    /**
     * 
     * @param {CommandInteraction} interaction 
     * @param {Bot} client 
     * @returns 
     */

	async run(interaction, client) {
        const options = interaction.options;
        const args = options.data;
        let language = "en";
        if(args[0]?.value === "de" || args[0]?.value === "lang_de") language = "de";

        return await this.response(interaction, (new this.embed())
            .setDescription(this.t(`${language}/${this.help.name}:d`))
            .setTitle(this.t(`${language}/${this.help.name}:t`))
        );
    };

    get isInfo() {
        return true;
    }
};