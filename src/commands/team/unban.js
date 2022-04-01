const {
  MessageEmbed,
  Interaction,
  Client,
  CommandInteraction,
  SnowflakeUtil,
} = require("discord.js");
const Command = require("../../classes/Command.js");
const Bot = require("../../classes/Bot.js");

class UnbanCommand extends Command {
  constructor(client) {
    super(client, {
      name: "unban",
      description: "Unbans a user",
      userAvailable: false,
      options: [
        {
          name: "user",
          description: "The user to unban",
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

    let member = args.find((x) => x.name === "user")?.value;
    if (!member) return this.error(interaction, "Please provide a valid user.");

    let reason = args.find((x) => x.name === "reason")?.value;
    if (!reason || reason?.length < 4)
      return this.error(interaction, "You must provide a valid reason.");

    let guild = interaction.guild;
    let ban = await guild.bans.fetch(member).catch((e) => {});
    if (!ban) return this.error(interaction, "This user is not banned.");

    guild.bans
      .remove(ban.user || member, reason)
      .then(async (user) => {
        let c = await client.schemas.case.findOne({
          user: member,
          deleted: { $ne: true },
          type: "ban",
        });

        c.deleted = true;
        await c.save();

        let unbanEmbed = new MessageEmbed()
          .setColor("GREEN")
          .setTitle("✅ Unban")
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
              value: `${user.tag} (${user.id})`,
              inline: true,
            },
          ]);

        let modlog =
          this.client.channels.cache.get(this.client.config.modlog) ||
          (await this.client.channels
            .fetch(this.client.config.modlog)
            .catch(this.Logger.error));
        if (modlog) modlog.send({ embeds: [unbanEmbed] });

        let unbanResponseEmbed = new this.embed()
          .setDescription(`The user has been **unbanned**.`)
          .setColor("GREEN");

        return this.response(interaction, unbanResponseEmbed);
      })
      .catch((e) => {
        client.Logger.error(e);
        return this.error(interaction, "Couldn't unban users. Contact Devs");
      });
  }
}

module.exports = UnbanCommand;
