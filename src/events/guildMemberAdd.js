const { MessageEmbed, GuildMemberManager, GuildAuditLogs, GuildMember } = require("discord.js");
const BaseEvent = require("../classes/Event.js");
const Bot = require("../classes/Bot.js");

class GuildMemberAddEvent extends BaseEvent {
    constructor() {
        super('guildMemberAdd');
    };

    /**
     * 
     * @param {Bot} client 
     * @param {GuildMember} member
     */

    async run(client, member) {
        if(member.partial) await member.fetch();

        let c = await client.schemas.case.findOne({ user: member.user.id, deleted: { $ne: true }, type: "mute" })
        if(!c) return;

        let muteEmbed = new MessageEmbed()
            .setColor("ORANGE").setTitle("🔇 Mute").setTimestamp()
            .setFooter("BTE Germany", "https://cdn.discordapp.com/icons/692825222373703772/a_e643511c769fd27a0f361d01c23f2cee.gif?size=1024")
            .addFields([
                {
                    name: "🚨 Moderator",
                    value: `${c.mod}`,
                    inline: true
                },{
                    name: "💬 Reason",
                    value: `||${c.reason}||`,
                    inline: true
                },{
                    name: "👤 User",
                    value: `${member?.user?.tag || member} (${member?.user?.id || member})`,
                    inline: true
                },{
                    name: "⏳ Duration",
                    value: `\`${client.parseTime(c.end-c.timestamp)}\``,
                    inline: true
                },{
                    name: "📌 End",
                    value: `<t:${Math.round(c.end/1000)}:R> | <t:${Math.round(c.end/1000)}:f>`,
                    inline: true
                }
            ])

        client.config.roles.muteRemove.forEach(r => {
            member.roles.remove(r).catch(client.Logger.error);
        })
        await member.roles.add(client.config.roles.muted).catch(client.Logger.error);

        member.send({ embeds: [ muteEmbed ]}).catch(e => {});
    };
};

module.exports = GuildMemberAddEvent;