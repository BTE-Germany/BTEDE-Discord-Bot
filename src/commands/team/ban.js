const {
  MessageEmbed,
  Interaction,
  Client,
  CommandInteraction,
} = require("discord.js");
const Command = require("../../classes/Command.js");
const Bot = require("../../classes/Bot.js");
const ms = require("ms");

class BanCommand extends Command {
  constructor(client) {
    super(client, {
      name: "ban",
      description: "Bans a user",
      userAvailable: false,
      options: [
        {
          name: "user",
          description: "Bans a user via mention",
          type: 1,
          options: [
            {
              name: "user",
              description: "The user to ban",
              type: 6,
              required: true,
            },
            {
              name: "duration",
              description: "The duration to ban the user for",
              type: 3,
              required: true,
            },
            {
              name: "reason",
              description: "The reason to ban the user for",
              type: 3,
              required: true,
            },
          ],
        },
        {
          name: "id",
          description: "Bans a user via ID",
          type: 1,
          options: [
            {
              name: "user",
              description: "The user to ban",
              type: 3,
              required: true,
            },
            {
              name: "duration",
              description: "The duration to ban the user for",
              type: 3,
              required: true,
            },
            {
              name: "reason",
              description: "The reason to ban the user for",
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

    let member = args.find((x) => x.name === "user")?.member;

    let userId = args.find((x) => x.name === "user")?.value || member?.user?.id;
    if (!userId)
      return this.error(interaction, "You must provide a valid user.");

    let reason = args.find((x) => x.name === "reason")?.value;
    if (!reason)
      return this.error(interaction, "You must provide a valid reason.");

    let duration = args.find((x) => x.name === "duration")?.value;
    if (!duration || !ms(duration) || isNaN(ms(duration)))
      return this.error(interaction, "You must provide a valid duration.");

    if (userId === mod.user.id) return this.error(interaction, "WARUM!??!?!");
    if (
      userId === client.user.id ||
      client.config.protectedUsers?.includes(userId)
    )
      return this.error(interaction, "You can't ban me or my dev.");

    let caseCount = await this.client.schemas.case.find({});

    let endTime = new Date().getTime() + ms(duration);

    let banCase = new this.client.schemas.case({
      id: caseCount.length + 1,
      end: endTime,
      reason: reason,
      type: "ban",
      lang:
        member?.roles.cache.get(client.config.roles.english) &&
        member?.roles.cache.get(client.config.roles.english)
          ? "both"
          : member?.roles.cache.get(client.config.roles.english)
          ? "en"
          : member?.roles.cache.get(client.config.roles.german)
          ? "de"
          : null,
      mod: mod.user.id,
      user: userId,
    });

    await banCase.save();

    let banEmbed = new this.embed()
      .setColor("RED")
      .setTitle("🔨 Ban")
      .setTimestamp()
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
          value: member ? `${member.user.tag} (${member.user.id})` : userId,
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

    let modlog =
      this.client.channels.cache.get(this.client.config.channels.modlog) ||
      (await this.client.channels
        .fetch(this.client.config.channels.modlog)
        .catch(this.Logger.error));
    if (modlog) modlog.send({ embeds: [banEmbed] });

    await member?.send({ embeds: [banEmbed] }).catch(client.Logger.warn);

    let guild = interaction.guild;
    guild.bans
      .create(userId, { reason: reason, days: 7 })
      .then((banInfo) => {
        let banResponseEmbed = new this.embed()
          .setDescription(
            `:airplane: \`${
              banInfo.user?.tag ?? banInfo.tag ?? banInfo
            }\` has been **banned**.`
          )
          .setColor("GREEN");

        return this.response(interaction, banResponseEmbed);
      })
      .catch((error) => {
        client.Logger.error(error);
        return this.error(
          interaction,
          "Error: ```js\n{e```".replace("{e", error)
        );
      });
  }
}

module.exports = BanCommand;
