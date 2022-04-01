const {
  MessageEmbed,
  Interaction,
  Client,
  CommandInteraction,
  SnowflakeUtil,
} = require("discord.js");
const Command = require("../../classes/Command.js");
const Bot = require("../../classes/Bot.js");

class UnmuteCommand extends Command {
  constructor(client) {
    super(client, {
      name: "unmute",
      description: "Unmutes a user",
      userAvailable: false,
      options: [
        {
          name: "user",
          description: "The user to unmute",
          type: 3,
          required: true,
        },
        {
          name: "reason",
          description: "The reason to unban the user for",
          type: 3,
          required: true,
        },
      ],
    });
  }

  /**
   *
   * @param {CommandInteraction} interaction
   * @param {Bot} client
   */

  async run(interaction, client) {
    const options = interaction.options;
    const args = options._hoistedOptions;
    const mod = interaction.member;

    let memberId = args.find((x) => x.name === "user")?.value;
    if (!memberId)
      return this.error(interaction, "Please provide a valid user.");

    let guild = interaction.guild;
    let member =
      guild.members.cache.get(memberId) ||
      (await guild.members.fetch(memberId).catch((e) => {})) ||
      memberId;

    let reason = args.find((x) => x.name === "reason")?.value;
    if (!reason || reason?.length < 4)
      return this.error(interaction, "You must provide a valid reason.");

    let c = await client.schemas.case.findOne({
      user: memberId,
      deleted: { $ne: true },
      type: "mute",
    });

    if (member?.roles) {
      if (c.lang === "en")
        await member.roles
          .add(client.config.roles.english)
          .catch(client.Logger.error);
      if (c.lang === "de")
        await member.roles
          .add(client.config.roles.german)
          .catch(client.Logger.error);
      if (c.lang === "both") {
        await member.roles
          .add(client.config.roles.english)
          .catch(client.Logger.error);
        await member.roles
          .add(client.config.roles.german)
          .catch(client.Logger.error);
      }
      await member.roles.add(client.config.roles.rules);
      await member.roles
        .remove(client.config.roles.muted)
        .catch(client.Logger.error);
    }

    c.deleted = true;
    await c.save();

    let unmuteEmbed = new MessageEmbed()
      .setColor("GREEN")
      .setTitle("✅ Unmute")
      .setTimestamp()
      .setFooter(
        "BTE Germany",
        "https://cdn.discordapp.com/icons/692825222373703772/a_e643511c769fd27a0f361d01c23f2cee.gif?size=1024"
      )
      .addFields([
        {
          name: "🚨 Moderator",
          value: `${mod.user.tag} (${mod.user.id})`,
          inline: true,
        },
        {
          name: "💬 Reason",
          value: `||${reason}||`,
          inline: true,
        },
        {
          name: "👤 User",
          value: `${member?.user?.tag || member} (${
            member?.user?.id || member
          })`,
          inline: true,
        },
      ]);

    let modlog =
      this.client.channels.cache.get(this.client.config.modlog) ||
      (await this.client.channels
        .fetch(this.client.config.modlog)
        .catch(this.Logger.error));
    if (modlog) await modlog.send({ embeds: [unmuteEmbed] });

    if (member.roles)
      await member.send({ embeds: [unmuteEmbed] }).catch((e) => {});

    let unmuteResponseEmbed = new this.embed()
      .setDescription(`The user has been **unmuted**.`)
      .setColor("GREEN");

    return this.response(interaction, unmuteResponseEmbed);
  }
}

module.exports = UnmuteCommand;
