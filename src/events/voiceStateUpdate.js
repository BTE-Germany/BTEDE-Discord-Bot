const { EmbedBuilder } = require("discord.js");
const BaseEvent = require("../classes/Event.js");
const Bot = require("../classes/Bot.js");
const voiceDiscord = require("@discordjs/voice");

module.exports = class extends BaseEvent {
  constructor() {
    super("voiceStateUpdate");
  }

  /**
   *
   * @param {Bot} client
   * @param {import("discord.js").VoiceState} oldState
   * @param {import("discord.js").VoiceState} newState
   */

  async run(client, oldState, newState) {
    if (
      oldState.channel &&
      oldState.channel.id === client.config.channels.waitingRoom &&
      oldState.channel.members.size === 1 &&
      oldState.channel.members.first().id === client.user.id
    ) {
      voiceDiscord.getVoiceConnections().forEach((con) => {
        con.disconnect();
      });
    }
    if (!(newState && newState.channel)) return;
    if (
      newState.channel.id != client.config.channels.waitingRoom ||
      newState.member.user.id === client.user.id
    )
      return;
    if (oldState?.channel?.id === newState?.channel?.id) return;

    setTimeout(async () => {
      const channel = newState.member.voice.channel;

      if (!channel?.members?.has(newState?.member?.user?.id)) return;

      const supportRoleMention = client.config?.roles?.supportPing
        ? `<@&${client.config.roles.supportPing}>`
        : null;

      const supportChannel = await channel.guild.channels
        .fetch(client.config.channels.supportPing)
        .catch(client.Logger.error);
      if (supportChannel) {
        supportChannel
          .send({
            content: supportRoleMention || undefined,
            embeds: [
              new EmbedBuilder()
                .setColor("#fcfc04")
                .setTitle("Support")
                .setDescription(
                  "Der User " +
                    "<@!" +
                    newState?.member?.user?.id +
                    ">" +
                    " ist im Waitingroom."
                ),
            ],
          })
          .catch(client.Logger.error);
      }

      const player = voiceDiscord.createAudioPlayer();
      const resource = voiceDiscord.createAudioResource(
        "https://cdn.discordapp.com/attachments/830063535664660480/895424717706657832/Waitingroom.mp3"
      );

      const connection = voiceDiscord.joinVoiceChannel({
        channelId: channel.id,
        guildId: channel.guild.id,
        adapterCreator: channel.guild.voiceAdapterCreator,
      });

      player.play(resource);
      connection.subscribe(player);

      connection.on(voiceDiscord.VoiceConnectionStatus.Disconnected, () => {
        connection.destroy();
      });

      player.on(voiceDiscord.AudioPlayerStatus.Idle, () => {
        player.stop();
      });
    }, 5 * 1000);
  }
};

