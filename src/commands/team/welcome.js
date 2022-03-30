const { MessageEmbed, Interaction, Client, CommandInteraction } = require('discord.js');
const Command = require("../../classes/Command.js");
const Bot = require("../../classes/Bot.js")

const JSONdb = require('simple-json-db');
const db = new JSONdb('./welcomedb.json');

class WelcomeCommand extends Command {
    constructor(client) {
        super(client, {
            name:"welcome",
            description:"Disables/Enables welcome messages for the server.",
            userAvailable: false,
        });
    };

    /**
     *
     * @param {CommandInteraction} interaction
     * @param {Bot} client
     */

    async run(interaction, client) {

        if(db.get("enabled") === true){
            db.set("enabled", false);
            return this.response(interaction, "Ok! I will no longer send welcome messages for this server.");
        }else{
            db.set("enabled", "Ok! I will now send welcome messages for this server.");
        }


    }
};

module.exports = WelcomeCommand;