const {EmbedBuilder, CommandInteraction} = require("discord.js");
const Bot = require("./Bot.js");

class BaseCommand {
    constructor(
        client,
        {
            description = "",
            name = "Beispiel Command",
            userAvailable = true,
            staffDc = false,
            aliases = [],
            options = [],
            queries = [],
        }
    ) {
        /**
         * The {@link Bot} the Command belongs to.
         * @type {Bot}
         */
        this.client = client;

        this.config = {userAvailable, options, queries, staffDc};
        this.help = {name, description, aliases};
        this.Logger = client?.Logger;
    }

    get embed() {
        return class extends EmbedBuilder {
            constructor(options) {
                super(options);
                this.setColor("#347aeb");
                this.setTimestamp(Date.now());
                this.setFooter({
                    text: "BTE Germany",
                    iconURL:
                        "https://cdn.discordapp.com/icons/692825222373703772/a_e643511c769fd27a0f361d01c23f2cee.gif?size=1024",
                });
            }
        };
    }

    /**
     *
     * @param {CommandInteraction} interaction
     */

    async run(interaction) {
        this.Logger.warn(
            "Ended up in command.js [" + JSON.stringify(this.config) + "]"
        );
    }

    /**
     *
     * @param {String} query
     */

    async queryHandler(query) {
        this.Logger.warn(
            "Ended up in command.js [" + JSON.stringify(this.config) + "]"
        );
        return [];
    }

    /**
     *
     * @param {String} guildId
     */

    async initialize(guildId) {
        try {
            const guild = await this.client.guilds.fetch(guildId);
            await guild.commands.create({
                name: this.help.name,
                description: this.help.description,
                dm_permission: false,
                options: this.config.options,
            });

            this.Logger.info(`Created /${this.help.name}`, "COMMANDS");
        } catch (error) {
            this.client.Logger.error(
                `Failed to register /${this.help.name}: ${error.message}`
            );
        }
    }

    /**
     *
     * @param interaction
     * @param {string} input
     * @param {Array} components
     * @returns
     */

    async response(interaction, input, components = []) {
        if (typeof input === "object") {
            const embeds = Array.isArray(input) ? input : [input];
            return await interaction
                .editReply({embeds, components})
                .catch(this.client.Logger.error);
        } else if (typeof input === "string") {
            return await interaction
                .editReply({content: input, components})
                .catch(this.client.Logger.error);
        }
    }

    /**
     *
     * @param interaction
     * @param {String} text
     * @returns
     */

    error(interaction, text) {
        return interaction
            .editReply({
                embeds: [
                    new EmbedBuilder().setColor("#ff0000").setDescription(":x: " + text),
                ],
            })
            .catch(this.client.Logger.error);
    }
}

module.exports = BaseCommand;
