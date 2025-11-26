const { Events } = require("discord.js");
const logger = require("./logger");
const { buildHeaderEmbed, buildContentPayload, getStarterMessage } = require("./messageBuilder");

const isTargetThread = (thread, config) => {
  if (!thread?.isThread?.()) return false;
  if (thread.parentId !== config.forumChannelId) return false;
  if (config.guildId && thread.guildId !== config.guildId) return false;
  return true;
};

const registerHandlers = ({ client, config, ensureTargetChannel, store }) => {
  const sendBoth = async (thread, sourceMessage, target) => {
    const embed = buildHeaderEmbed(thread);
    const embedMessage = await target.send({ embeds: [embed] });

    const contentPayload = await buildContentPayload(sourceMessage);
    if (!contentPayload) {
      throw new Error(`No content payload available for thread ${thread.id}.`);
    }
    const contentMessage = await target.send(contentPayload);

    await store.set(thread.id, {
      embedMessageId: embedMessage.id,
      contentMessageId: contentMessage.id,
    });

    logger.info(
      `Crossposted thread ${thread.id} to ${target.id} (embed ${embedMessage.id}, content ${contentMessage.id}).`
    );

    return { embedMessage, contentMessage };
  };

  const ensureEmbed = async (thread, target, pair) => {
    const resolved = pair || (await store.fetchPair(thread, target));
    const embed = buildHeaderEmbed(thread);

    if (resolved.embed) {
      await resolved.embed.edit({ embeds: [embed] });
      return resolved.embed;
    }

    const sent = await target.send({ embeds: [embed] });
    await store.set(thread.id, { embedMessageId: sent.id });
    return sent;
  };

  const ensureContent = async (thread, sourceMessage, target, pair) => {
    const resolved = pair || (await store.fetchPair(thread, target));
    const payload = await buildContentPayload(sourceMessage);

    if (!payload) {
      throw new Error(`No content payload available for thread ${thread.id}.`);
    }

    if (resolved.content) {
      await resolved.content.edit(payload);
      return resolved.content;
    }

    const sent = await target.send(payload);
    await store.set(thread.id, { contentMessageId: sent.id });
    return sent;
  };

  client.on(Events.ThreadCreate, async (thread) => {
    if (!isTargetThread(thread, config)) return;
    if (thread.ownerId === client.user.id) return;

    const channel = await ensureTargetChannel();
    if (!channel) return;

    const starterMessage = await getStarterMessage(thread);

    try {
      await sendBoth(thread, starterMessage, channel);
    } catch (error) {
      logger.error(`Failed to crosspost thread ${thread.id}:`, error);
    }
  });

  client.on(Events.ThreadUpdate, async (oldThread, newThread) => {
    if (!isTargetThread(newThread, config)) return;
    if (oldThread?.name === newThread.name) return;

    const target = await ensureTargetChannel();
    if (!target) return;

    try {
      const pair = await store.fetchPair(newThread, target);

      const starterMessage = await getStarterMessage(newThread);
      if (!pair.embed || !pair.content) {
        if (pair.embed) await pair.embed.delete().catch((err) => logger.warn(`Failed to delete stale embed ${pair.embed.id}:`, err));
        if (pair.content) await pair.content.delete().catch((err) => logger.warn(`Failed to delete stale content ${pair.content.id}:`, err));
        await sendBoth(newThread, starterMessage, target);
        logger.info(`Recreated full crosspost for thread ${newThread.id} after partial/missing messages.`);
        return;
      }

      await ensureEmbed(newThread, target, pair);
      await ensureContent(newThread, starterMessage, target, pair);

      logger.info(`Updated crosspost header for thread ${newThread.id}.`);
    } catch (error) {
      logger.error(`Failed to update crosspost header for thread ${newThread.id}:`, error);
    }
  });

  client.on(Events.MessageUpdate, async (oldMessage, newMessage) => {
    const message = newMessage.partial ? await newMessage.fetch().catch(() => null) : newMessage;
    if (!message) return;
    const thread = message.channel;

    if (!isTargetThread(thread, config)) return;

    if (message.id !== thread.id) return;

    const target = await ensureTargetChannel();
    if (!target) return;

    try {
      const pair = await store.fetchPair(thread, target);

      if (!pair.embed || !pair.content) {
        if (pair.embed) await pair.embed.delete().catch((err) => logger.warn(`Failed to delete stale embed ${pair.embed.id}:`, err));
        if (pair.content) await pair.content.delete().catch((err) => logger.warn(`Failed to delete stale content ${pair.content.id}:`, err));
        await sendBoth(thread, message, target);
        logger.info(`Recreated full crosspost for thread ${thread.id} after partial/missing messages.`);
        return;
      }

      await ensureEmbed(thread, target, pair);
      await ensureContent(thread, message, target, pair);
      logger.info(`Updated crosspost for thread ${thread.id}.`);
    } catch (error) {
      logger.error(`Failed to update crosspost for thread ${thread.id}:`, error);
    }
  });

  const deleteCrosspost = async (thread, target, reason) => {
    const pair = await store.fetchPair(thread, target);
    if (pair.embed) await pair.embed.delete().catch((err) => logger.warn(`Failed to delete embed ${pair.embed.id}:`, err));
    if (pair.content) await pair.content.delete().catch((err) => logger.warn(`Failed to delete content ${pair.content.id}:`, err));
    await store.remove(thread.id);
    logger.info(`Deleted crosspost for thread ${thread.id}${reason ? ` (${reason})` : ""}.`);
  };

  client.on(Events.MessageDelete, async (deleted) => {
    const message = deleted.partial ? await deleted.fetch().catch(() => null) : deleted;
    if (!message) return;

    const thread = message.channel;
    if (!isTargetThread(thread, config)) return;

    if (message.id !== thread.id) return;

    const target = await ensureTargetChannel();
    if (!target) return;

    try {
      await deleteCrosspost(thread, target, "starter deleted");
    } catch (error) {
      logger.error(`Failed to delete crosspost for thread ${thread.id}:`, error);
    }
  });

  client.on(Events.ThreadDelete, async (thread) => {
    if (!isTargetThread(thread, config)) return;

    const target = await ensureTargetChannel();
    if (!target) return;

    try {
      await deleteCrosspost(thread, target, "thread deleted");
    } catch (error) {
      logger.error(`Failed to delete crosspost for removed thread ${thread.id}:`, error);
    }
  });
};

module.exports = { registerHandlers };
