const {
    MessageEmbed,
    Interaction,
    Client,
    CommandInteraction,
} = require("discord.js");
const Command = require("../classes/Command.js");
const Bot = require("../classes/Bot.js");
const IDS = require("./activites.json");

module.exports = class extends Command {
    constructor(client) {
        super(client, {
            name: "activity",
            description: "Start an activity in your voice channel",
            options: [
                {
                    name: "activity",
                    description: "The ID of the activity to start",
                    type: "string",
                    required: true,
                    autocomplete: true,
                },
            ],
            userAvailable: true,
        });
    }

    /**
     *
     * @param {CommandInteraction} interaction
     * @param {Bot} client
     */

    async run(interaction, client) {
        if(!interaction.isCommand) return;
        const options = interaction.options;
        const args = options.data;
        //check if user is in a voice channel
        if (!interaction.message.member.voice.channel) {
            interaction.reply(
                "❌ | You must be in a voice channel to use this command", {ephemeral: true}
            );
        }else{
            if(!args.activity){
                interaction.reply(
                    "❌ | You must provide an activity ID", {ephemeral: true}
                );
        }else{
            try{
                client.channels.cache.get(interaction.guild.members.cache.get(interaction.user.id).voice.channel.id).createInvite({
                    targetType: 2,
                    targetApplication: args.activity,
                }).then(invite =>
                    
                   interaction.reply(
                    `✅ | Invite created! Click here to start: ${invite.url}`));
            }
            catch (e) {
                interaction.reply(
                    "❌ | An error occured while creating the invite. Did you provide a valid ID?", {ephemeral: true}
                );
            }
            }
        }
    }
    }