const {
    MessageEmbed,
    Interaction,
    Client,
    CommandInteraction,
} = require("discord.js");
const Command = require("../../classes/Command.js");
const Bot = require("../../classes/Bot.js");

class WarnCommand extends Command {
    constructor(client) {
        super(client, {
            name: "duty",
            description: "Get a support duty.",
            userAvailable: false

        });
    }

    /**
     *
     * @param {CommandInteraction} interaction
     * @param {Bot} client
     */

    async run(interaction, client) {
        const user = interaction.member;

        if(client.guilds.cache.get(client.config.guild).members.cache.get(user.id).roles.cache.has(client.config.roles.duty) && client.guilds.cache.get(client.config.guild).members.cache.get(user.id).roles.cache.has(client.config.roles.support)){
            this.response(interaction, "You are now __not__ on duty!");
            return
        }
        if(client.guilds.cache.get(client.config.guild).members.cache.get(user.id).roles.cache.has(client.config.roles.support) || client.guilds.cache.get(client.config.staffDc.id).members.cache.get(user.id).roles.cache.has(client.config.roles.supports) ) {
            this.response(interaction, "You are now __on duty__!");
            return;
        }else{
            this.error(interaction, "You are not a support member! You can't get on duty!");
        }
    }
}

module.exports = WarnCommand;
