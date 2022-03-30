const { MessageEmbed, GuildMemberManager, GuildAuditLogs, GuildMember } = require("discord.js");
const BaseEvent = require("../classes/Event.js");
const Bot = require("../classes/Bot.js");

const JSONdb = require('simple-json-db');
const db = new JSONdb('./welcomedb.json');


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


        //send welcome message for new members

        if(await db.get('enabled') === true) {

            let timenow = Math.floor(new Date() / 1000)
            let diff = timenow - db.get(member.user.id)
            if (!db.has(member.user.id) || diff > 1800) {
                await db.set(member.user.id, timenow);
                await client.channels.cache.get(client.config.general).send(`Herzlich Willkommen <@${member.user.id}> bei BTE Germany!

Schau doch mal hier vorbei 🙂 :
・<#796403957135573072>
・<#781620107406606347>
・Fortschrittskarte: https://bte-germany.de/map`);
            }
        }
        };

}

module.exports = GuildMemberAddEvent;