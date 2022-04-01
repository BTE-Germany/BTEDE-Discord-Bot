const {
  MessageEmbed,
  Interaction,
  Client,
  CommandInteraction,
} = require("discord.js");
const Command = require("../../classes/Command.js");
const Bot = require("../../classes/Bot.js");

class WarnCommand extends Command {
  constructor(client) {
    super(client, {
      name: "kick",
      description: "Kicks a user",
      userAvailable: false,
      options: [
        {
          name: "user",
          description: "Kicks a user via mention",
          type: 1,
          options: [
            {
              name: "user",
              description: "The user to kick",
              type: 6,
              required: true,
            },
            {
              name: "reason",
              description: "The reason to kick the user for",
              type: 3,
              required: true,
            },
          ],
        },
        {
          name: "id",
          description: "Kicks a user via ID",
          type: 1,
          options: [
            {
              name: "user",
              description: "The user to kick",
              type: 3,
              required: true,
            },
            {
              name: "reason",
              description: "The reason to kick the user for",
              type: 3,
              required: true,
            },
          ],
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
    const args = options.data[0].options;
    const mod = interaction.member;

    let member =
      args[0]?.member ||
      (await interaction.guild.members
        .fetch(args[0]?.value)
        .catch(this.Logger.error));
    if (!member)
      return this.error(interaction, "Der User wurde nicht gefunden.");

    let reason = args[1]?.value;
    if (!reason || reason?.length < 4)
      return this.error(interaction, "You must provide a valid reason.");

    if (reason === "@hacked") {
      reason = ` ||Your account has been hacked because you probably clicked on an unsafe link.\nAs a result, your account has been used to send messages that compromise the security of other users.\nPlease enable two-factor authentication (https://support.discord.com/hc/en-us/articles/219576828-Setting-up-Two-Factor-Authentication) on your account to increase the security of your account and prevent further such incidents.\nPlease also keep in mind that you can NOT trust everyone and that you should not open just any link.|| `;
    }

    if (member.roles.cache.get(client.config.roles.team))
      return this.error(interaction, "Du kannst keinen Teamler kicken.");
    if (mod.roles.highest.position <= member.roles.highest.position)
      return this.error(
        interaction,
        "Du kannst den User nicht kicken, da du nicht höher als er gerankt bist."
      );
    if (member.user.id === mod.user.id)
      return this.error(interaction, "WARUM!??!?!");
    if (
      member.user.id === client.user.id ||
      member.user.id === "552530299423293441"
    )
      return this.error(interaction, "You cant kick this user.");

    let caseCount = await this.client.schemas.case.find({});

    let kickCase = new this.client.schemas.case({
      id: caseCount.length + 1,
      end: null,
      reason: reason,
      type: "kick",
      mod: mod.user.id,
      user: member.user.id,
    });

    await kickCase.save();

    let kickEmbed = new MessageEmbed()
      .setColor("ORANGE")
      .setTitle("👢 Kick")
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
          value: `${member.user.tag} (${member.user.id})`,
          inline: true,
        },
      ]);

    let modlog =
      this.client.channels.cache.get(this.client.config.channels.modlog) ||
      (await this.client.channels
        .fetch(this.client.config.channels.modlog)
        .catch(this.Logger.error));
    if (modlog) modlog.send({ embeds: [kickEmbed] });

    await member.send({ embeds: [kickEmbed] }).catch(this.Logger.error);
    await member.kick(reason).catch(client.Logger.error);

    let kickResponseEmbed = new this.embed()
      .setDescription(`The user has been **kicked**.`)
      .setColor("GREEN");

    return this.response(interaction, kickResponseEmbed);
  }
}

module.exports = WarnCommand;
