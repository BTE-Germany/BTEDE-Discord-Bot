const {
  MessageEmbed,
  GuildMemberManager,
  GuildAuditLogs,
  GuildMember,
  MessageActionRow,
  Message,
  MessageButton,
} = require("discord.js");
const BaseEvent = require("../classes/Event.js");
const Bot = require("../classes/Bot.js");

class GuildMemberAddEvent extends BaseEvent {
  constructor() {
    super("guildMemberAdd");
  }

  /**
   *
   * @param {Bot} client
   * @param {GuildMember} member
   */

  async run(client, member) {
    if (member.partial) await member.fetch();

    // mute
    let c = await client.schemas.case.findOne({
      user: member.user.id,
      deleted: { $ne: true },
      type: "mute",
    });
    if (c) {
      let muteEmbed = new MessageEmbed()
        .setColor("ORANGE")
        .setTitle("🔇 Mute")
        .setTimestamp()
        .setFooter(
          "BTE Germany",
          "https://cdn.discordapp.com/icons/692825222373703772/a_e643511c769fd27a0f361d01c23f2cee.gif?size=1024"
        )
        .addFields([
          {
            name: "🚨 Moderator",
            value: `${c.mod}`,
            inline: true,
          },
          {
            name: "💬 Reason",
            value: `||${c.reason}||`,
            inline: true,
          },
          {
            name: "👤 User",
            value: `${member?.user?.tag || member} (${
              member?.user?.id || member
            })`,
            inline: true,
          },
          {
            name: "⏳ Duration",
            value: `\`${client.parseTime(c.end - c.timestamp)}\``,
            inline: true,
          },
          {
            name: "📌 End",
            value: `<t:${Math.round(c.end / 1000)}:R> | <t:${Math.round(
              c.end / 1000
            )}:f>`,
            inline: true,
          },
        ]);

      client.config.roles.muteRemove.forEach((r) => {
        member.roles.remove(r).catch(client.Logger.error);
      });

      await member.roles
        .add(client.config.roles.muted)
        .catch(client.Logger.error);

      member.send({ embeds: [muteEmbed] }).catch((e) => {});
    }

    // welcome message
    if (client.config.welcomeMessage === true) {
      let userId = member.user.id;
      let now = Date.now();
      if (!client.joins.has(userId) || client.joins.get(userId) >= now - 18e5) {
        let generalChat = await client.channels.fetch(
          client.config.channels.generalDE
        );
        generalChat.send({
          content: `<a:btede:853745991525859338> Herzlich Willkommen <@!${userId}> bei BTE-Germany!`,
          components: [
            new MessageActionRow().addComponents([
              new MessageButton()
                .setLabel("Informationen")
                .setStyle("LINK")
                .setURL(
                  "https://discord.com/channels/692825222373703772/796403957135573072/882324083285573682"
                ),

              new MessageButton()
                .setLabel("FAQ")
                .setStyle("LINK")
                .setURL(
                  "https://discord.com/channels/692825222373703772/796404244282212412/842070909460021309"
                ),

              new MessageButton()
                .setLabel("Fortschrittskarte")
                .setStyle("LINK")
                .setURL("https://bte-germany.de/map"),
            ]),
          ],
        });
        client.joins.set(userId, now);
      }
    }
  }
}

module.exports = GuildMemberAddEvent;
