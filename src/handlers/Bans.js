const { EmbedBuilder, Colors } = require("discord.js");

module.exports = (client) => {
  client.Logger.info("Started Handler", "BansHandler");
  setInterval(async () => {
    let cases = await client.schemas.case.find({
      end: { $lt: new Date().getTime() },
      deleted: false,
      type: "ban",
    });
    if (cases.length === 0) return;

    for (const c of cases) {
      let guild =
        client.guilds.cache.get(client.config.guild) ||
        (await client.guilds.cache
          .get(client.config.guild)
          .catch(client.Logger.error));
      if (!guild) continue;

      let ban = await guild.bans.fetch(c.user).catch((e) => {});
      if (!ban) {
        c.deleted = true;
        await c.save();
        continue;
      }

      guild.bans
        .remove(ban.user || member, "Ban duration expired")
        .then(async (user) => {
          let log =
            guild.channels.cache.get(client.config.channels.modlog) ||
            (await guild.channels
              .fetch(client.config.channels.modlog)
              .catch(client.Logger.error));
          if (!log) return client.Logger.error("No Log in Bans.js");

          let unbanEmbed = new EmbedBuilder()
            .setColor(Colors.Green)
            .setTitle("✅ Unban")
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
                value: `Ban Duration Expired`,
                inline: true,
              },
              {
                name: "👤 User",
                value: `${user?.tag || user} (${user?.id || user})`,
                inline: true,
              },
            ]);

          await log.send({embeds: [unbanEmbed]});

          c.deleted = true;
          await c.save();
        });
    }
  }, 5000);
};
