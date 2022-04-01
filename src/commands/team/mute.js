const {
  MessageEmbed,
  Interaction,
  Client,
  CommandInteraction,
} = require("discord.js");
const Command = require("../../classes/Command.js");
const Bot = require("../../classes/Bot.js");
const ms = require("ms");

class MuteCommand extends Command {
  constructor(client) {
    super(client, {
      name: "mute",
      description: "Mutes a user",
      userAvailable: false,
      options: [
        {
          name: "user",
          description: "Mutes a user via mention",
          type: 1,
          options: [
            {
              name: "user",
              description: "The user to mute",
              type: 6,
              required: true,
            },
            {
              name: "duration",
              description: "The duration to mute the user for",
              type: 3,
              required: true,
            },
            {
              name: "reason",
              description: "The reason to mute the user for",
              type: 3,
              required: true,
            },
          ],
        },
        {
          name: "id",
          description: "Mutes a user via ID",
          type: 1,
          options: [
            {
              name: "user",
              description: "The user to mute",
              type: 3,
              required: true,
            },
            {
              name: "duration",
              description: "The duration to mute the user for",
              type: 3,
              required: true,
            },
            {
              name: "reason",
              description: "The reason to mute the user for",
              type: 3,
              required: true,
            },
          ],
        },
      ],
    });
  }

  /**
   * @param {CommandInteraction} interaction
   * @param {Bot} client
   */

  async run(interaction, client) {
    const options = interaction.options;
    const args = options.data[0].options;
    const mod = interaction.member;

    let member =
      args.find((x) => x.name === "user")?.member ||
      (await interaction.guild.members
        .fetch(args[0]?.value)
        .catch((e) => {})) ||
      args[0]?.value;
    if (!member?.user && (member.length != 18 || isNaN(parseInt(member))))
      return this.error(interaction, "You must provide a valid user.");

    let reason = args.find((x) => x.name === "reason")?.value;
    if (!reason || reason?.length < 4)
      return this.error(interaction, "You must provide a valid reason.");

    let duration = args.find((x) => x.name === "duration")?.value;
    if (!duration || !ms(duration) || isNaN(ms(duration)))
      return this.error(interaction, "You must provide a valid duration.");

    if (member?.roles || member?.user) {
      if (member.roles.cache.get(client.config.roles.team))
        return this.error(interaction, "Du kannst keinen Teamler muten.");
      if (mod.roles.highest.position <= member.roles.highest.position)
        return this.error(
          interaction,
          "Du kannst den User nicht muten, da du nicht höher als er gerankt bist."
        );
      if (member.user.id === mod.user.id)
        return this.error(interaction, "WARUM!??!?!");
      if (
        member.user.id ===
        client.user.id /*|| member.user.id === "552530299423293441"*/
      )
        return this.error(interaction, "This user can't be muted.");
      if (member.roles.cache.get(client.config.roles.muted))
        return this.error(interaction, "The user is already muted.");
    }

    let caseCount = await this.client.schemas.case.find({});

    let endTime = new Date().getTime() + ms(duration);

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
        {
          name: "⏳ Duration",
          value: `\`${duration}\``,
          inline: true,
        },
        {
          name: "📌 End",
          value: `<t:${Math.round(endTime / 1000)}:R> | <t:${Math.round(
            endTime / 1000
          )}:f>`,
          inline: true,
        },
      ]);

    let roles = [];
    if (member?.roles || member?.user) {
      client.config.roles.muteRemove.forEach((r) => {
        if (member.roles.cache.get(r)) {
          member.roles.remove(r).catch(client.Logger.error);
          roles.push(r);
        }
      });
      await member.roles
        .add(client.config.roles.muted)
        .catch(client.Logger.error);
    }

    let muteCase = new this.client.schemas.case({
      id: caseCount.length + 1,
      end: endTime,
      reason: reason,
      type: "mute",
      lang: member?.roles
        ? member.roles.cache.get(client.config.roles.english) &&
          member.roles.cache.get(client.config.roles.english)
          ? "both"
          : member.roles.cache.get(client.config.roles.english)
          ? "en"
          : "de"
        : "de",
      mod: mod.user.id,
      user: member?.user?.id || member,
      roles: roles,
    });

    await muteCase.save();

    let modlog =
      this.client.channels.cache.get(this.client.config.channels.modlog) ||
      (await this.client.channels
        .fetch(this.client.config.channels.modlog)
        .catch(this.Logger.error));
    if (modlog) modlog.send({ embeds: [muteEmbed] });

    if (member?.roles || member?.user)
      member.send({ embeds: [muteEmbed] }).catch((e) => {});

    let muteResponseEmbed = new this.embed()
      .setDescription(`The user has been **muted**.`)
      .setColor("GREEN");

    return this.response(interaction, muteResponseEmbed);
  }
}

module.exports = MuteCommand;
