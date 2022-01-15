const { MessageEmbed, Interaction, Client, CommandInteraction } = require('discord.js');
const Command = require("../../classes/Command.js");
const Bot = require("../../classes/Bot.js")

class WarnCommand extends Command {
    constructor(client) {
        super(client, {
            name:"warn",
            description:"Warns a user",
            userAvailable: false,
            options: [{
                "name":"user",
                "description":"Warns a user via mention",
                "type":1,
                "options":[{
                    "name":"user",
                    "description":"The user to warn",
                    "type":6,
                    "required":true
                },{
                    "name":"reason",
                    "description":"The reason to warn the user for",
                    "type":3,
                    "required":true
                }]
            },{
                "name":"id",
                "description":"Warns a user via ID",
                "type":1,
                "options":[{
                    "name":"user",
                    "description":"The user to warn",
                    "type":3,
                    "required":true
                },{
                    "name":"reason",
                    "description":"The reason to warn the user for",
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
        const mod = interaction.member;
        
        let member = args[0]?.member || await interaction.guild.members.fetch(args[0]?.value).catch(this.Logger.error);
        if(!member) return this.error(interaction, "Der User wurde nicht gefunden.");

        let reason = args[1]?.value;
        if(!reason || reason?.length < 4) return this.error(interaction, "You must provide a valid reason.");

        if(member.roles.cache.get(client.config.roles.team)) return this.error(interaction, "You can't warn staff members.");
        if(mod.roles.highest.position <= member.roles.highest.position) return this.error(interaction, "You can't warn users with higher roles than you.");
        if(member.user.id === mod.user.id) return this.error(interaction, "WARUM!??!?!");
        if(member.user.id === client.user.id || member.user.id === "552530299423293441") return this.error(interaction, "You can't warn this user");

        let caseCount = await this.client.schemas.case.find({ });

        let warnCase = new this.client.schemas.case({
            id: caseCount.length+1,
            end: null,
            reason: reason,
            type: "warn",
            mod: mod.user.id,
            user: member.user.id
        });

        await warnCase.save();

        let warnEmbed = new MessageEmbed()
            .setColor("YELLOW")
            .setTitle("🚧 Warning")
            .setTimestamp()
            .setFooter("BTE Germany", "https://cdn.discordapp.com/icons/692825222373703772/a_e643511c769fd27a0f361d01c23f2cee.gif?size=1024")
            .addFields([
                {
                    name: "🚨 Moderator",
                    value: `${mod.user.tag} (${mod.user.id})`,
                    inline: true
                },{
                    name: "💬 Reason",
                    value: `||${reason}||`,
                    inline: true
                },{
                    name: "👤 User",
                    value: `${member.user.tag} (${member.user.id})`,
                    inline: true
                }
            ])

        let modlog = this.client.channels.cache.get(this.client.config.modlog) || await this.client.channels.fetch(this.client.config.modlog).catch(this.Logger.error);
        if(modlog) modlog.send({ embeds: [ warnEmbed ] });

        member.send({ embeds: [ warnEmbed ] }).catch(this.Logger.error);

        let userWarns = await this.client.schemas.case.find({ type: "warn", user: member.user.id, deleted: false });

        let warnResponseEmbed = new this.embed()
            .setDescription(`The user has been **warned**. [\`${userWarns.length}\`. warn]`)
            .setColor("GREEN")

        return this.response(interaction, warnResponseEmbed);
    }
};

module.exports = WarnCommand;