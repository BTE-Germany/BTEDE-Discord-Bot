const { MessageEmbed, Interaction, Client, CommandInteraction } = require('discord.js');
const Command = require("../../classes/Command.js");
const Bot = require("../../classes/Bot.js")

class CasesCommand extends Command {
    constructor(client) {
        super(client, {
            name:"cases",
            description:"Looks up a users cases",
            userAvailable: false,
            options: [{
                "name":"user",
                "description":"Looks up a users cases by mention",
                "type":1,
                "options":[{
                    "name":"user",
                    "description":"The user to look up the cases from",
                    "type":6,
                    "required":true
                }]
            },{
                "name":"id",
                "description":"Looks up a users cases by user id",
                "type":1,
                "options":[{
                    "name":"user",
                    "description":"The user to look up the cases from",
                    "type":3,
                    "required":true
                }]
            }]
        });
    };

    /**
     * 
     * @param {CommandInteraction} interaction
     * @param {Bot} client
     */   

    async run(interaction, client) {
        const options = interaction.options;
        const args = options.data[0].options;
        
        let member = args.find(x => x.name === "user")?.member || await interaction.guild.members.fetch(args.find(x => x.name === "user")?.value).catch(e => {}) || args.find(x => x.name === "user")?.value;
        if(!member) return this.error(interaction, "Der User wurde nicht gefunden.");
        if(!member.user && (member.length != 18 || isNaN(parseInt(member)))) return this.error(interaction, "You must provide a valid user.");

        let userCases = await client.schemas.case.find({ user: member?.user?.id || member });

        let casesEmbed = new this.embed()
            .setAuthor(member?.user?.username || member, member?.user?.avatarURL({ dynamic: true }) || null)
            .setDescription(`${member?.user?.tag || member} has ${userCases.length} Case${(userCases.length === 1) ? "" : "s"}.`);
            
        userCases.forEach(userCase => {
            casesEmbed.addField(`${userCase.deleted ? "~~" : ""}Case: ${userCase.id}${userCase.deleted ? "~~" : ""}`, `Type: \`${userCase.type}\`\nReason: ||${userCase.reason}||`, true)
        });

        return this.response(interaction, casesEmbed);
    }
};

module.exports = CasesCommand;