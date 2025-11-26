const { Events } = require("discord.js");

const isTargetThread = (thread, config) => {
  if (!thread?.isThread?.()) return false;
  if (thread.parentId !== config.forumChannelId) return false;
  if (config.guildId && thread.guildId !== config.guildId) return false;
  return true;
};

const registerHandlers = ({ client, config, ensureTargetChannel, store, buildCrosspostPayload, getStarterMessage }) => {
  client.on(Events.ThreadCreate, async (thread) => {
    if (!isTargetThread(thread, config)) return;
    if (thread.ownerId === client.user.id) return;

    const channel = await ensureTargetChannel();
    if (!channel) return;

    const starterMessage = await getStarterMessage(thread);
    const payload = await buildCrosspostPayload(thread, thread.ownerId, starterMessage);

    try {
      const sent = await channel.send(payload);
      await store.set(thread.id, sent.id);
      console.log(`Crossposted forum thread ${thread.id} to ${channel.id}`);
    } catch (error) {
      console.error(`Failed to crosspost thread ${thread.id}:`, error);
    }
  });

  client.on(Events.ThreadUpdate, async (oldThread, newThread) => {
    if (!isTargetThread(newThread, config)) return;
    if (oldThread?.name === newThread.name) return;

    const target = await ensureTargetChannel();
    if (!target) return;

    try {
      const sourceMessage = await getStarterMessage(newThread);
      const payload = await buildCrosspostPayload(newThread, newThread.ownerId, sourceMessage);
      const crosspostMessage = await store.fetchMessage(newThread, target);

      if (crosspostMessage) {
        await crosspostMessage.edit(payload);
        console.log(`Updated crosspost header for thread ${newThread.id} (message ${crosspostMessage.id}).`);
      } else {
        const sent = await target.send(payload);
        await store.set(newThread.id, sent.id);
        console.log(`Recreated crosspost for renamed thread ${newThread.id} (message ${sent.id}).`);
      }
    } catch (error) {
      console.error(`Failed to update crosspost header for thread ${newThread.id}:`, error);
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

    const authorId = message.author?.id || thread.ownerId;
    const payload = await buildCrosspostPayload(thread, authorId, message);
    const editPayload = payload.files.length
      ? payload
      : {
          ...payload,
          files: [],
          attachments: [],
        };

    try {
      const crosspostMessage = await store.fetchMessage(thread, target);
      if (crosspostMessage) {
        await crosspostMessage.edit(editPayload);
        console.log(`Updated crosspost for thread ${thread.id} (message ${crosspostMessage.id}).`);
      } else {
        const sent = await target.send(editPayload);
        await store.set(thread.id, sent.id);
        console.log(`Recreated crosspost for thread ${thread.id} (message ${sent.id}).`);
      }
    } catch (error) {
      console.error(`Failed to update crosspost for thread ${thread.id}:`, error);
    }
  });

  client.on(Events.MessageDelete, async (deleted) => {
    const message = deleted.partial ? await deleted.fetch().catch(() => null) : deleted;
    if (!message) return;

    const thread = message.channel;
    if (!isTargetThread(thread, config)) return;

    if (message.id !== thread.id) return;

    const target = await ensureTargetChannel();
    if (!target) return;

    try {
      const crosspostMessage = await store.fetchMessage(thread, target);
      if (!crosspostMessage) {
        await store.remove(thread.id);
        return;
      }
      await crosspostMessage.delete();
      await store.remove(thread.id);
      console.log(`Deleted crosspost for thread ${thread.id} (message ${crosspostMessage.id}).`);
    } catch (error) {
      console.error(`Failed to delete crosspost for thread ${thread.id}:`, error);
    }
  });

  client.on(Events.ThreadDelete, async (thread) => {
    if (!isTargetThread(thread, config)) return;

    const target = await ensureTargetChannel();
    if (!target) return;

    try {
      const crosspostMessage = await store.fetchMessage(thread, target);
      if (!crosspostMessage) {
        await store.remove(thread.id);
        return;
      }
      await crosspostMessage.delete();
      await store.remove(thread.id);
      console.log(`Deleted crosspost for removed thread ${thread.id} (message ${crosspostMessage.id}).`);
    } catch (error) {
      console.error(`Failed to delete crosspost for removed thread ${thread.id}:`, error);
    }
  });
};

module.exports = { registerHandlers };
