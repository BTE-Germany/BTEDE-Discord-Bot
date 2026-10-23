const { ChannelType, Events } = require("discord.js");
const logger = require("./logger");

const MANAGED_VOICE_CHANNEL_GROUPS = ["Builder", "General"];
const VOICE_CHANNEL_SYNC_INTERVAL_MS = 5000;

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const byManagedIndex = (a, b) => {
  if (a.index !== b.index) return a.index - b.index;
  return a.channel.createdTimestamp - b.channel.createdTimestamp;
};

const toPermissionOverwrites = (channel) =>
  channel.permissionOverwrites.cache.map((overwrite) => ({
    id: overwrite.id,
    allow: overwrite.allow.bitfield,
    deny: overwrite.deny.bitfield,
    type: overwrite.type,
  }));

const buildCreateOptions = (name, template, configuredParentId) => {
  const options = {
    name,
    type: ChannelType.GuildVoice,
    parent: configuredParentId || template?.parentId || undefined,
  };

  if (!template) return options;

  options.bitrate = template.bitrate;
  options.userLimit = template.userLimit;
  options.rtcRegion = template.rtcRegion;
  options.videoQualityMode = template.videoQualityMode;
  options.permissionOverwrites = toPermissionOverwrites(template);

  return options;
};

const getManagedVoiceChannels = (guild, baseName) => {
  const nameRegex = new RegExp(`^${escapeRegex(baseName)}\\s+(\\d+)$`, "i");

  return guild.channels.cache
    .filter((channel) => {
      if (channel.type !== ChannelType.GuildVoice) return false;
      return nameRegex.test(channel.name);
    })
    .map((channel) => ({
      channel,
      index: Number(channel.name.match(nameRegex)[1]),
      occupied: channel.members.size > 0,
    }))
    .sort(byManagedIndex);
};

const pickSpareChannel = (emptyChannels, occupiedChannels) => {
  if (!emptyChannels.length) return null;

  const highestOccupiedIndex = occupiedChannels.reduce((highest, item) => Math.max(highest, item.index), 0);
  const afterOccupied = emptyChannels.find((item) => item.index > highestOccupiedIndex);

  return afterOccupied || emptyChannels[emptyChannels.length - 1];
};

const syncVoiceGroup = async (guild, baseName) => {
  const managedChannels = getManagedVoiceChannels(guild, baseName);
  const occupiedChannels = managedChannels.filter((item) => item.occupied);
  const emptyChannels = managedChannels.filter((item) => !item.occupied);
  const spareChannel = pickSpareChannel(emptyChannels, occupiedChannels);
  const keptChannels = [...occupiedChannels, ...(spareChannel ? [spareChannel] : [])];
  const keptChannelIds = new Set(keptChannels.map((item) => item.channel.id));
  const template = managedChannels[0]?.channel || null;

  for (const item of managedChannels) {
    if (!keptChannelIds.has(item.channel.id)) {
      await item.channel.delete(`Managed voice cleanup for ${baseName}`).catch((error) => {
        logger.warn(`Failed to delete empty voice channel ${item.channel.name} (${item.channel.id}):`, error);
      });
    }
  }

  const desiredChannels = [...occupiedChannels, ...(spareChannel ? [spareChannel] : [])];
  let nextIndex = 1;

  for (const item of desiredChannels) {
    const desiredName = `${baseName} ${nextIndex}`;
    if (item.channel.name !== desiredName) {
      await item.channel.setName(desiredName, `Managed voice renumbering for ${baseName}`).catch((error) => {
        logger.warn(`Failed to rename voice channel ${item.channel.name} (${item.channel.id}) to ${desiredName}:`, error);
      });
    }
    nextIndex += 1;
  }

  if (!spareChannel) {
    const desiredName = `${baseName} ${nextIndex}`;
    await guild.channels
      .create(buildCreateOptions(desiredName, template))
      .then((channel) => logger.info(`Created managed voice channel ${channel.name} (${channel.id}).`))
      .catch((error) => logger.error(`Failed to create managed voice channel ${desiredName}:`, error));
  }
};

const createVoiceChannelManager = ({ client, config }) => {
  let syncRunning = false;
  let syncRequested = false;
  let syncTimeout = null;

  const getGuilds = async () => {
    if (config.guildId) {
      const guild = await client.guilds.fetch(config.guildId).catch((error) => {
        logger.error(`Failed to fetch configured guild ${config.guildId}:`, error);
        return null;
      });
      return guild ? [guild] : [];
    }

    return Array.from(client.guilds.cache.values());
  };

  const syncGuild = async (guild) => {
    await guild.channels.fetch();

    for (const baseName of MANAGED_VOICE_CHANNEL_GROUPS) {
      await syncVoiceGroup(guild, baseName);
    }
  };

  const syncAll = async () => {
    if (syncRunning) {
      syncRequested = true;
      return;
    }

    syncRunning = true;
    do {
      syncRequested = false;
      const guilds = await getGuilds();
      for (const guild of guilds) {
        await syncGuild(guild).catch((error) => logger.error(`Managed voice sync failed for guild ${guild.id}:`, error));
      }
    } while (syncRequested);
    syncRunning = false;
  };

  const scheduleSync = () => {
    if (syncTimeout) return;
    syncTimeout = setTimeout(() => {
      syncTimeout = null;
      syncAll().catch((error) => logger.error("Scheduled managed voice sync failed:", error));
    }, VOICE_CHANNEL_SYNC_INTERVAL_MS);
  };

  client.once(Events.ClientReady, () => {
    logger.info(`Managed voice channels enabled for: ${MANAGED_VOICE_CHANNEL_GROUPS.join(", ")}.`);
    syncAll().catch((error) => logger.error("Initial managed voice sync failed:", error));
    setInterval(() => {
      syncAll().catch((error) => logger.error("Periodic managed voice sync failed:", error));
    }, VOICE_CHANNEL_SYNC_INTERVAL_MS);
  });

  client.on(Events.VoiceStateUpdate, (oldState, newState) => {
    if (config.guildId && oldState.guild.id !== config.guildId && newState.guild.id !== config.guildId) return;
    scheduleSync();
  });

  client.on(Events.ChannelDelete, (channel) => {
    if (!channel.guild) return;
    if (config.guildId && channel.guild.id !== config.guildId) return;
    scheduleSync();
  });
};

module.exports = { createVoiceChannelManager };
