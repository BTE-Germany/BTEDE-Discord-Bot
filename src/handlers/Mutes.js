const { EmbedBuilder, Colors } = require("discord.js");

module.exports = (client) => {
  client.Logger.info("Started Handler", "MutesHandler");
  setInterval(async () => {
    let cases = await client.schemas.case.find({
      end: { $lt: new Date().getTime() },
      deleted: false,
      type: "mute",
    });
    if (cases.length === 0) return;

    for (const c of cases) {
      let guild =
        client.guilds.cache.get(client.config.guild) ||
        (await client.guilds.cache
          .get(client.config.guild)
          .catch(client.Logger.error));
      if (!guild) continue;

      let member = await guild.members.fetch(c.user).catch(client.Logger.error);
      if (!member) continue;

      if (c.lang === "en")
        member.roles
          .add(client.config.roles.english)
          .catch(client.Logger.error);
      if (c.lang === "de")
        member.roles.add(client.config.roles.german).catch(client.Logger.error);
      if (c.lang === "both") {
        member.roles
          .add(client.config.roles.english)
          .catch(client.Logger.error);
        member.roles.add(client.config.roles.german).catch(client.Logger.error);
      }
      await member.roles.add(client.config.roles.rules);
      member.roles.remove(client.config.roles.muted).catch(client.Logger.error);

      if (c?.roles && c?.roles?.length != 0) {
        c.roles.forEach((role) => {
          member.roles.add(role).catch(client.Logger.error);
        });
      }

      let log =
        guild.channels.cache.get(client.config.channels.modlog) ||
        (await guild.channels
          .fetch(client.config.channels.modlog)
          .catch(client.Logger.error));
      if (!log) client.Logger.error("No Log in Mutes.js");

      let unmuteEmbed = new EmbedBuilder()
        .setColor(Colors.Green)
        .setTitle("✅ Unmute")
        .setTimestamp()
        .setFooter({
          text: "BTE Germany",
          iconURL:
            "https://cdn.discordapp.com/icons/692825222373703772/a_e643511c769fd27a0f361d01c23f2cee.gif?size=1024",
        })
        .addFields([
          {
            name: "🚨 Moderator",
            value: `${client.user.tag} (${client.user.id})`,
            inline: true,
          },
          {
            name: "💬 Reason",
            value: `Mute Duration Expired`,
            inline: true,
          },
          {
            name: "👤 User",
            value: `${member.user.tag} (${member.user.id})`,
            inline: true,
          },
        ]);

      await log.send({embeds: [unmuteEmbed]});
      member.send({ embeds: [unmuteEmbed] }).catch(client.Logger.warn);

      c.deleted = true;
      await c.save();
    }
  }, 5000);
};
