const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  Colors,
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
   * @param {import("discord.js").GuildMember} member
   */

  async run(client, member) {
    if (member.partial) await member.fetch();
    await member.user.fetch();

    // log
    /* let joinLog = await client.channels
      .fetch(client.config.channels.linklog)
      .catch((e) => {
        console.error("Critical Error: Couldnt load join log!");
      });
     if (joinLog)
      joinLog.send({
        embeds: [
          new EmbedBuilder()
            .setColor(member.user.accentColor)
            .setThumbnail(member.user.avatarURL({ dynamic: true }))
            .setImage(member.user.bannerURL({ dynamic: true }))
            .setTimestamp()
            .setFooter({
              text: member.user.id,
              iconURL: member.guild.iconURL({ dynamic: true }) ?? undefined,
            })
            .setDescription(`<@!${member.user.id}> (${member.user.tag})`)
            .setTitle("📈 New User"),
        ],
      }); */

    // mute
    let c = await client.schemas.case.findOne({
      user: member.user.id,
      deleted: { $ne: true },
      type: "mute",
    });
    if (c) {
      let muteEmbed = new EmbedBuilder()
        .setColor(Colors.Orange)
        .setTitle("🔇 Mute")
        .setTimestamp()
        .setFooter({
          text: "BTE Germany",
          iconURL:
            "https://cdn.discordapp.com/icons/692825222373703772/a_e643511c769fd27a0f361d01c23f2cee.gif?size=1024",
        })
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
    if (
      client.config.welcomeMessage === true &&
      member.guild.id === client.config.guild
    ) {
      let userId = member.user.id;
      let now = Date.now();
      if (!client.joins.has(userId) || client.joins.get(userId) >= now - 18e5) {
        let generalChat = await client.channels.fetch(
          client.config.channels.generalDE
        );
        generalChat.send({
          content: `<a:btede:853745991525859338> Herzlich Willkommen <@!${userId}> bei **BTE-Germany**!`,
          components: [
            new ActionRowBuilder().addComponents([
              new ButtonBuilder()
                .setLabel("Informationen")
                .setStyle(ButtonStyle.Link)
                .setURL(
                  "https://discord.com/channels/692825222373703772/796403957135573072/882324083285573682"
                ),

              new ButtonBuilder()
                .setLabel("FAQ")
                .setStyle(ButtonStyle.Link)
                .setURL(
                  "https://discord.com/channels/692825222373703772/796404244282212412/842070909460021309"
                ),

              new ButtonBuilder()
                .setLabel("Fortschrittskarte")
                .setStyle(ButtonStyle.Link)
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
