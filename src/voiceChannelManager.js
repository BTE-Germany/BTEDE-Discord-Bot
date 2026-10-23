const { ChannelType, Events } = require("discord.js");
const logger = require("./logger");

const MANAGED_VOICE_CHANNEL_CATEGORY = process.env.DISCORD_VC_CATEGORY;
const MANAGED_VOICE_CHANNEL_POSITION_BEFORE = process.env.DISCORD_VC_POSITION_BEFORE?.trim();
const MANAGED_VOICE_CHANNEL_GROUPS = ["🔊│Builder", "🔊│General"];
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

const isInManagedVoiceCategory = (channel) =>
  Boolean(MANAGED_VOICE_CHANNEL_CATEGORY) &&
  channel?.type === ChannelType.GuildVoice &&
  channel.parentId === MANAGED_VOICE_CHANNEL_CATEGORY;

const buildCreateOptions = (name, template) => {
  const options = {
    name,
    type: ChannelType.GuildVoice,
    parent: MANAGED_VOICE_CHANNEL_CATEGORY,
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
      if (!isInManagedVoiceCategory(channel)) return false;
      return nameRegex.test(channel.name);
    })
    .map((channel) => {
      const userCount = guild.voiceStates.cache.filter((state) => state.channelId === channel.id).size;
      return {
        channel,
        index: Number(channel.name.match(nameRegex)[1]),
        userCount,
        occupied: userCount > 0,
      };
    })
    .sort(byManagedIndex);
};

const pickSpareChannel = (emptyChannels, occupiedChannels) => {
  if (!emptyChannels.length) return null;

  const highestOccupiedIndex = occupiedChannels.reduce((highest, item) => Math.max(highest, item.index), 0);
  const afterOccupied = emptyChannels.find((item) => item.index > highestOccupiedIndex);

  // Empty gaps are removed; only a channel after the occupied ones can be the reserve.
  return afterOccupied || null;
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
      if (guild.voiceStates.cache.some((state) => state.channelId === item.channel.id)) continue;
      await item.channel.delete(`Managed voice cleanup for ${baseName}`).then(() => {
        logger.info(`Deleted empty managed voice channel ${item.channel.name} (${item.channel.id}).`);
      }).catch((error) => {
        logger.warn(`Failed to delete empty voice channel ${item.channel.name} (${item.channel.id}):`, error);
      });
    }
  }

  const desiredChannels = [...occupiedChannels, ...(spareChannel ? [spareChannel] : [])];
  let nextIndex = 1;

  for (const item of desiredChannels) {
    const desiredName = `${baseName} ${nextIndex}`;
    if (item.channel.name !== desiredName) {
      const previousName = item.channel.name;
      await item.channel.setName(desiredName, `Managed voice renumbering for ${baseName}`).then(() => {
        logger.info(`Renamed managed voice channel ${previousName} (${item.channel.id}) to ${desiredName}.`);
      }).catch((error) => {
        logger.warn(`Failed to rename voice channel ${previousName} (${item.channel.id}) to ${desiredName}:`, error);
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

const sortManagedVoiceChannels = async (guild, force = false) => {
  const desiredChannels = MANAGED_VOICE_CHANNEL_GROUPS.flatMap((baseName) =>
    getManagedVoiceChannels(guild, baseName).map((item) => item.channel),
  );
  if (!desiredChannels.length) return;

  // Discord sorts voice and stage channels together, separately from text channels.
  const currentChannels = guild.channels.cache
    .filter((channel) => channel.parentId === MANAGED_VOICE_CHANNEL_CATEGORY &&
      (channel.type === ChannelType.GuildVoice || channel.type === ChannelType.GuildStageVoice))
    .map((channel) => channel)
    .sort((a, b) => a.position - b.position);
  const managedIds = new Set(desiredChannels.map((channel) => channel.id));
  const otherChannels = currentChannels.filter((channel) => !managedIds.has(channel.id));
  const anchorIndex = otherChannels.findIndex((channel) => channel.id === MANAGED_VOICE_CHANNEL_POSITION_BEFORE);
  const insertIndex = anchorIndex === -1 ? otherChannels.length : anchorIndex + 1;
  const orderedChannels = [
    ...otherChannels.slice(0, insertIndex),
    ...desiredChannels,
    ...otherChannels.slice(insertIndex),
  ];

  if (!force && orderedChannels.every((channel, index) => channel.id === currentChannels[index].id)) return;

  // Submit the complete voice/stage order so no unrelated channel can split the block.
  await guild.channels.setPositions(
    orderedChannels.map((channel, position) => ({ channel: channel.id, position })),
  );
  logger.info(`Sorted managed voice channels in category ${MANAGED_VOICE_CHANNEL_CATEGORY}: ${desiredChannels.map((channel) => channel.name).join(", ")}.`);
};

const createVoiceChannelManager = ({ client, config }) => {
  if (!MANAGED_VOICE_CHANNEL_CATEGORY) {
    logger.warn("Managed voice channels disabled: DISCORD_VC_CATEGORY is not configured.");
    return;
  }

  let syncRunning = false;
  let syncRequested = false;
  let syncTimeout = null;
  let initialized = false;

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

  const syncGuild = async (guild, initial) => {
    await guild.channels.fetch();

    const category = guild.channels.cache.get(MANAGED_VOICE_CHANNEL_CATEGORY);
    if (category?.type !== ChannelType.GuildCategory) {
      if (initial) logger.warn(`Managed voice category ${MANAGED_VOICE_CHANNEL_CATEGORY} not found in guild ${guild.id}; skipping cleanup.`);
      return;
    }

    if (initial) {
      const existing = MANAGED_VOICE_CHANNEL_GROUPS
        .flatMap((baseName) => getManagedVoiceChannels(guild, baseName))
        .sort((a, b) => a.channel.position - b.channel.position);
      logger.info(`Startup voice inventory for guild ${guild.id}: ${existing.length} managed channels (${existing.filter((item) => item.occupied).length} occupied).`);
      for (const [index, item] of existing.entries()) {
        logger.info(`  ${index + 1}. ${item.channel.name} (${item.channel.id}): ${item.userCount} users`);
      }
    }

    for (const baseName of MANAGED_VOICE_CHANNEL_GROUPS) {
      await syncVoiceGroup(guild, baseName);
    }

    if (initial) await guild.channels.fetch();
    await sortManagedVoiceChannels(guild, initial);
    if (initial) logger.info(`Startup voice cleanup and sorting completed for guild ${guild.id}.`);
  };

  const syncAll = async (initial = false) => {
    if (syncRunning) {
      syncRequested = true;
      return;
    }

    syncRunning = true;
    try {
      do {
        syncRequested = false;
        const guilds = await getGuilds();
        for (const guild of guilds) {
          await syncGuild(guild, initial).catch((error) => logger.error(`Managed voice sync failed for guild ${guild.id}:`, error));
        }
        initial = false;
      } while (syncRequested);
    } finally {
      syncRunning = false;
    }
  };

  const scheduleSync = () => {
    if (!initialized) return;
    if (syncTimeout) return;
    syncTimeout = setTimeout(() => {
      syncTimeout = null;
      syncAll().catch((error) => logger.error("Scheduled managed voice sync failed:", error));
    }, VOICE_CHANNEL_SYNC_INTERVAL_MS);
  };

  const initialize = async () => {
    logger.info(`Managed voice channels enabled for: ${MANAGED_VOICE_CHANNEL_GROUPS.join(", ")}.`);
    await syncAll(true).catch((error) => logger.error("Initial managed voice sync failed:", error));
    initialized = true;
    setInterval(() => {
      syncAll().catch((error) => logger.error("Periodic managed voice sync failed:", error));
    }, VOICE_CHANNEL_SYNC_INTERVAL_MS);
  };

  if (client.isReady()) initialize();
  else client.once(Events.ClientReady, initialize);

  client.on(Events.VoiceStateUpdate, (oldState, newState) => {
    if (config.guildId && oldState.guild.id !== config.guildId && newState.guild.id !== config.guildId) return;
    if (!isInManagedVoiceCategory(oldState.channel) && !isInManagedVoiceCategory(newState.channel)) return;
    scheduleSync();
  });

  client.on(Events.ChannelDelete, (channel) => {
    if (!channel.guild) return;
    if (config.guildId && channel.guild.id !== config.guildId) return;
    if (!isInManagedVoiceCategory(channel)) return;
    scheduleSync();
  });
};

module.exports = { createVoiceChannelManager };
