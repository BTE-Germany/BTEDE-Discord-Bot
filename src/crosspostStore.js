const logger = require("./logger");

class CrosspostStore {
  constructor(model, targetChannelId) {
    this.model = model;
    this.targetChannelId = targetChannelId;
    this.map = new Map(); // threadId -> { embedMessageId, contentMessageId }
  }

  async load() {
    try {
      this.map.clear();
      const records = await this.model.find({ channelId: this.targetChannelId }).lean();
      records.forEach((record) =>
        this.map.set(record.threadId, {
          embedMessageId: record.embedMessageId || null,
          contentMessageId: record.contentMessageId || null,
        })
      );
      if (records.length) {
        logger.info(`Loaded ${records.length} crosspost references from database.`);
      }
    } catch (error) {
      logger.error("Failed to load crosspost map from database:", error);
    }
  }

  get(threadId) {
    return this.map.get(threadId);
  }

  async set(threadId, ids) {
    const current = this.map.get(threadId) || {};
    const merged = {
      embedMessageId: ids.embedMessageId ?? current.embedMessageId ?? null,
      contentMessageId: ids.contentMessageId ?? current.contentMessageId ?? null,
    };

    this.map.set(threadId, merged);
    try {
      await this.model.findOneAndUpdate(
        { threadId },
        {
          threadId,
          embedMessageId: merged.embedMessageId,
          contentMessageId: merged.contentMessageId,
          channelId: this.targetChannelId,
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
    } catch (error) {
      logger.error(`Failed to persist crosspost mapping for thread ${threadId}:`, error);
    }
  }

  async remove(threadId) {
    this.map.delete(threadId);
    try {
      await this.model.deleteOne({ threadId });
    } catch (error) {
      logger.error(`Failed to remove crosspost mapping for thread ${threadId}:`, error);
    }
  }

  async fetchPair(thread, targetChannel) {
    const record = this.get(thread.id);
    if (!record) return { embed: null, content: null };

    const result = { embed: null, content: null };
    const fetchOne = async (messageId) => {
      try {
        return await targetChannel.messages.fetch(messageId);
      } catch (error) {
        if (error?.code === 10008 || error?.status === 404) {
          return null;
        }
        throw error;
      }
    };

    if (record.embedMessageId) {
      const embedMessage = await fetchOne(record.embedMessageId);
      if (embedMessage) {
        result.embed = embedMessage;
      } else {
        logger.warn(`Embed message missing for thread ${thread.id}; will recreate on next action.`);
      }
    }

    if (record.contentMessageId) {
      const contentMessage = await fetchOne(record.contentMessageId);
      if (contentMessage) {
        result.content = contentMessage;
      } else {
        logger.warn(`Content message missing for thread ${thread.id}; will recreate on next action.`);
      }
    }

    if (!record.embedMessageId && !record.contentMessageId) {
      await this.remove(thread.id);
    }

    return result;
  }

  async prune(pruneDays) {
    if (pruneDays === 0) return; // disabled

    if (pruneDays < 0) {
      try {
        await this.model.deleteMany({ channelId: this.targetChannelId });
        this.map.clear();
        logger.info("Pruned all crosspost records (pruneDays < 0).");
      } catch (error) {
        logger.error("Failed to prune all crosspost records:", error);
      }
      return;
    }

    const cutoff = new Date(Date.now() - pruneDays * 24 * 60 * 60 * 1000);
    try {
      const result = await this.model.deleteMany({
        channelId: this.targetChannelId,
        updatedAt: { $lt: cutoff },
      });
      if (result.deletedCount) {
        await this.load();
        logger.info(`Pruned ${result.deletedCount} crosspost records older than ${pruneDays} days.`);
      }
    } catch (error) {
      logger.error("Failed to prune stale crosspost records:", error);
    }
  }
}

module.exports = { CrosspostStore };
