const { MessageEmbed, Interaction, Client, CommandInteraction } = require('discord.js');
const Command = require("../../classes/Command.js");
const Bot = require("../../classes/Bot.js");

class NewCommand extends Command {
    constructor(client) {
        super(client, {
            name:"new",
            description:"Registers a new builder or trial",
            userAvailable: false,
            options: [{
                "name":"user",
                "description":"The user to register",
                "type":6,
                "required":true
            }]
        });
    };

    /**
     * @param {CommandInteraction} interaction
     * @param {Bot} client
     */   

    async run(interaction, client) {
        const options = interaction.options;
        const args = options._hoistedOptions;
        const mod = interaction.member;
        let role = args[0]?.value;
        
        let member = args.find(x => x.name === "user")?.member;
        if(!member) return this.error(interaction, "You have to mention a valid member.")

        if(!member.roles.cache.get(client.config.roles.rules)) return this.error(interaction, "This user did not accept the rules.");
        if(member.roles.cache.get(client.config.roles.builder) && role === "builder") return this.error(interaction, "This user is already a builder.");
        if(member.roles.cache.get(client.config.roles.trial) && role === "trial") return this.error(interaction, "This user is already a trial.");

        if(client.usersInCreateProcess.has(member.user.id)) return this.error(interaction, "The user is already in registration process. (by <@!{id}>)".replace("{id}", client.usersInCreateProcess.get(member.user.id).mod))

        if(client.usersInCreateProcess.find(x => x.mod === mod.user.id)) return this.error(interaction, "You are already in a registration process. ($l)".replace("$l", client.usersInCreateProcess.find(x => x.mod === mod.user.id).msgurl));
        
        let msg = await this.response(interaction, `**Registration**\n<@!${member.user.id}> (${member.user.tag} | ${member.user.id})\n\n<@!${mod.user.id}> (${mod.user.tag} | ${mod.user.id})`, require("../../structures/newSelectRow.js"));

        client.usersInCreateProcess.set(member.user.id, {
            id: member.user.id,
            role: "builder",
            minecraft: null,
            uuid: null,
            city: null,
            federalState: null,
            creationImages: null,
            referenceImages: null,
            coordinates: null,
            mod: mod.user.id,
            msg: msg.id,
            msgurl: msg.url,
            step: null,
            tag: member.user.tag,
            channel: msg.channel.id,
            platform: "java",
            onward: true,
        });
    };
};

module.exports = NewCommand;