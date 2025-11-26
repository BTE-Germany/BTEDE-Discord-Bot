const { Events } = require("discord.js");
const logger = require("./logger");
const { buildHeaderEmbed, buildContentPayload, getStarterMessage } = require("./messageBuilder");

const isTargetThread = (thread, config) => {
    if (!thread?.isThread?.()) return false;
    if (thread.parentId !== config.forumChannelId) return false;
    if (config.guildId && thread.guildId !== config.guildId) return false;
    return true;
};

const registerHandlers = ({client, config, ensureTargetChannel, store, colorStore}) => {
    const threadQueues = new Map();

    const runInThreadQueue = (threadId, task) => {
        const prev = threadQueues.get(threadId) || Promise.resolve();
        const next = prev.catch(() => {}).then(task);
        threadQueues.set(threadId, next.finally(() => {
            if (threadQueues.get(threadId) === next) {
                threadQueues.delete(threadId);
            }
        }));
        return next;
    };
    const sendCrosspost = async ({sourceId, thread, sourceMessage, target, isReply}) => {
    const color = await colorStore.ensure(thread.id);
    const embed = buildHeaderEmbed(thread, isReply, color);
    const embedMessage = await target.send({ embeds: [embed] });

    const contentPayload = await buildContentPayload(sourceMessage);
    if (!contentPayload) {
      throw new Error(`No content payload available for ${isReply ? "reply" : "thread"} ${sourceId}.`);
    }
    // For replies: prefer replying to the crossposted target of the original reply, else fall back to the latest content in this thread, else send to channel.
    let contentMessage = null;
    if (isReply && sourceMessage?.reference?.messageId) {
      const refPair = await store.fetchPair(sourceMessage.reference.messageId, target);
      if (refPair?.content) {
        contentMessage = await refPair.content.reply(contentPayload);
      }
    }
    if (!contentMessage) {
      const lastContent = await store.getLastContentMessage(thread.id, target);
      if (isReply && lastContent) {
        contentMessage = await lastContent.reply(contentPayload);
      } else {
        contentMessage = await target.send(contentPayload);
      }
    }

    await store.set(sourceId, {
      embedMessageId: embedMessage.id,
      contentMessageId: contentMessage.id,
      threadId: thread.id,
      sourceMessageId: isReply ? sourceId : thread.id,
    });
    store.updateLastContent(thread.id, contentMessage.id);

    const label = isReply ? `reply ${sourceId}` : `thread ${thread.id}`;
    logger.info(`Crossposted ${label} to ${target.id} (embed ${embedMessage.id}, content ${contentMessage.id}).`);

    return {embedMessage, contentMessage};
  };

    const ensureCrosspost = async ({sourceId, thread, sourceMessage, target, isReply}) => {
        const pair = await store.fetchPair(sourceId, target);

        if (!pair.embed || !pair.content) {
            if (pair.embed) await pair.embed.delete().catch((err) => logger.warn(`Failed to delete stale embed ${pair.embed.id}:`, err));
            if (pair.content) await pair.content.delete().catch((err) => logger.warn(`Failed to delete stale content ${pair.content.id}:`, err));
            return sendCrosspost({sourceId, thread, sourceMessage, target, isReply});
        }

        const color = await colorStore.ensure(thread.id);
        const embed = buildHeaderEmbed(thread, isReply, color);
        await pair.embed.edit({embeds: [embed]});

        const contentPayload = await buildContentPayload(sourceMessage);
        if (!contentPayload) {
            throw new Error(`No content payload available for ${isReply ? "reply" : "thread"} ${sourceId}.`);
        }
        await pair.content.edit(contentPayload);
        store.updateLastContent(thread.id, pair.content.id);

        return pair;
    };

    const deleteCrosspost = async (sourceId, target, reason) => {
        const pair = await store.fetchPair(sourceId, target);
        if (pair.embed) await pair.embed.delete().catch((err) => logger.warn(`Failed to delete embed ${pair.embed.id}:`, err));
        if (pair.content) await pair.content.delete().catch((err) => logger.warn(`Failed to delete content ${pair.content.id}:`, err));
        await store.remove(sourceId);
        store.clearLastContent(pair.threadId, pair.content?.id);
        // If no crossposts remain for the thread, drop its color
        const remaining = store.getByThread(pair.threadId || "");
        if (!remaining.length) {
            await colorStore.delete(pair.threadId);
        }
        logger.info(`Deleted crosspost ${sourceId}${reason ? ` (${reason})` : ""}.`);
    };

    client.on(Events.ThreadCreate, async (thread) => {
        if (!isTargetThread(thread, config)) return;
        if (thread.ownerId === client.user.id) return;

        runInThreadQueue(thread.id, async () => {
            const channel = await ensureTargetChannel();
            if (!channel) return;

            const starterMessage = await getStarterMessage(thread);

            try {
                await sendCrosspost({
                    sourceId: thread.id,
                    thread,
                    sourceMessage: starterMessage,
                    target: channel,
                    isReply: false
                });
            } catch (error) {
                logger.error(`Failed to crosspost thread ${thread.id}:`, error);
            }
        });
    });

    client.on(Events.ThreadUpdate, async (oldThread, newThread) => {
        if (!isTargetThread(newThread, config)) return;
        if (oldThread?.name === newThread.name) return;

        runInThreadQueue(newThread.id, async () => {
            const target = await ensureTargetChannel();
            if (!target) return;

            try {
                const starterMessage = await getStarterMessage(newThread);
                await ensureCrosspost({
                    sourceId: newThread.id,
                    thread: newThread,
                    sourceMessage: starterMessage,
                    target,
                    isReply: false,
                });
                logger.info(`Updated crosspost header for thread ${newThread.id}.`);
            } catch (error) {
                logger.error(`Failed to update crosspost header for thread ${newThread.id}:`, error);
            }
        });
    });

    client.on(Events.MessageCreate, async (message) => {
        if (message.author?.bot) return;
        const thread = message.channel;
        if (!isTargetThread(thread, config)) return;
        if (message.id === thread.id) return; // starter handled by ThreadCreate

        runInThreadQueue(thread.id, async () => {
            const target = await ensureTargetChannel();
            if (!target) return;

            try {
                await sendCrosspost({sourceId: message.id, thread, sourceMessage: message, target, isReply: true});
            } catch (error) {
                logger.error(`Failed to crosspost reply ${message.id} for thread ${thread.id}:`, error);
            }
        });
    });

    client.on(Events.MessageUpdate, async (oldMessage, newMessage) => {
        const message = newMessage.partial ? await newMessage.fetch().catch(() => null) : newMessage;
        if (!message) return;
        const thread = message.channel;

        if (!isTargetThread(thread, config)) return;

        runInThreadQueue(thread.id, async () => {
            const target = await ensureTargetChannel();
            if (!target) return;

            try {
                if (message.id === thread.id) {
                    await ensureCrosspost({sourceId: thread.id, thread, sourceMessage: message, target, isReply: false});
                    logger.info(`Updated crosspost for thread ${thread.id}.`);
                } else {
                    await ensureCrosspost({sourceId: message.id, thread, sourceMessage: message, target, isReply: true});
                    logger.info(`Updated crossposted reply ${message.id} for thread ${thread.id}.`);
                }
            } catch (error) {
                logger.error(`Failed to update crosspost for thread ${thread.id}:`, error);
            }
        });
    });

    client.on(Events.MessageDelete, async (deleted) => {
        const message = deleted.partial ? await deleted.fetch().catch(() => null) : deleted;
        if (!message) return;

        const thread = message.channel;
        if (!isTargetThread(thread, config)) return;

        runInThreadQueue(thread.id, async () => {
            const target = await ensureTargetChannel();
            if (!target) return;

            try {
                await deleteCrosspost(message.id, target, message.id === thread.id ? "starter deleted" : "reply deleted");
            } catch (error) {
                logger.error(`Failed to delete crosspost for thread ${thread.id}:`, error);
            }
        });
    });

    client.on(Events.ThreadDelete, async (thread) => {
        if (!isTargetThread(thread, config)) return;

        runInThreadQueue(thread.id, async () => {
            const target = await ensureTargetChannel();
            if (!target) return;

            try {
                await deleteCrosspost(thread.id, target, "thread deleted");
                const replies = store.getByThread(thread.id);
                for (const reply of replies) {
                    if (reply.embedMessageId) {
                        await target.messages
                            .delete(reply.embedMessageId)
                            .then(() => logger.info(`Deleted reply embed ${reply.embedMessageId} for thread ${thread.id}.`))
                            .catch((err) => logger.warn(`Failed to delete reply embed ${reply.embedMessageId}:`, err));
                    }
                    if (reply.contentMessageId) {
                        await target.messages
                            .delete(reply.contentMessageId)
                            .then(() => logger.info(`Deleted reply content ${reply.contentMessageId} for thread ${thread.id}.`))
                            .catch((err) => logger.warn(`Failed to delete reply content ${reply.contentMessageId}:`, err));
                    }
                    await store.remove(reply.sourceMessageId);
                }
                await store.removeByThread(thread.id);
                await colorStore.delete(thread.id);
            } catch (error) {
                logger.error(`Failed to delete crosspost for removed thread ${thread.id}:`, error);
            }
        });
    });
};

module.exports = {registerHandlers};
