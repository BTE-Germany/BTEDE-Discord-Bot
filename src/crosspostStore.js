const logger = require("./logger");

class CrosspostStore {
  constructor(model, targetChannelId) {
    this.model = model;
    this.targetChannelId = targetChannelId;
    this.map = new Map(); // sourceMessageId -> { embedMessageId, contentMessageId, threadId }
  }

  async load() {
    try {
      this.map.clear();
      const records = await this.model.find({}).lean();
      records.forEach((record) => {
        const sourceId = record.sourceMessageId;
        if (!sourceId) return;
        this.map.set(sourceId, {
          embedMessageId: record.embedMessageId || null,
          contentMessageId: record.contentMessageId || null,
          threadId: record.threadId || null,
        });
      });
      if (records.length) {
        logger.info(`Loaded ${records.length} crosspost references from database.`);
      }
    } catch (error) {
      logger.error("Failed to load crosspost map from database:", error);
    }
  }

  get(sourceId) {
    return this.map.get(sourceId);
  }

  async set(sourceId, ids) {
    const current = this.map.get(sourceId) || {};
    const merged = {
      embedMessageId: ids.embedMessageId ?? current.embedMessageId ?? null,
      contentMessageId: ids.contentMessageId ?? current.contentMessageId ?? null,
      threadId: ids.threadId ?? current.threadId ?? null,
    };

    this.map.set(sourceId, merged);
    try {
      await this.model.findOneAndUpdate(
        { sourceMessageId: sourceId },
        {
          sourceMessageId: sourceId,
          embedMessageId: merged.embedMessageId,
          contentMessageId: merged.contentMessageId,
          threadId: merged.threadId,
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
    } catch (error) {
      logger.error(`Failed to persist crosspost mapping for source ${sourceId}:`, error);
    }
  }

  async remove(sourceId) {
    this.map.delete(sourceId);
    try {
      await this.model.deleteOne({ sourceMessageId: sourceId });
    } catch (error) {
      logger.error(`Failed to remove crosspost mapping for source ${sourceId}:`, error);
    }
  }

  async removeByThread(threadId) {
    for (const [sourceId, record] of this.map) {
      if (record.threadId === threadId) {
        this.map.delete(sourceId);
      }
    }
    try {
      await this.model.deleteMany({ threadId });
    } catch (error) {
      logger.error(`Failed to remove crosspost mappings for thread ${threadId}:`, error);
    }
  }

  getByThread(threadId) {
    const records = [];
    for (const [sourceId, record] of this.map) {
      if (record.threadId === threadId) {
        records.push({ sourceMessageId: sourceId, ...record });
      }
    }
    return records;
  }

  async fetchPair(entity, targetChannel) {
    const sourceId = typeof entity === "string" ? entity : entity.id;
    const record = this.get(sourceId);
    if (!record) return { embed: null, content: null, threadId: null, sourceMessageId: null };

    const result = { embed: null, content: null, threadId: record.threadId, sourceMessageId: sourceId };
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
        logger.warn(`Embed message missing for source ${sourceId}; will recreate on next action.`);
      }
    }

    if (record.contentMessageId) {
      const contentMessage = await fetchOne(record.contentMessageId);
      if (contentMessage) {
        result.content = contentMessage;
      } else {
        logger.warn(`Content message missing for source ${sourceId}; will recreate on next action.`);
      }
    }

    return result;
  }

  async prune(pruneDays) {
    if (pruneDays === 0) return; // disabled

    if (pruneDays < 0) {
      try {
        await this.model.deleteMany({});
        this.map.clear();
        logger.info(`Pruned all crosspost records (pruneDays < 0, sourceMessageId).`);
      } catch (error) {
        logger.error("Failed to prune all crosspost records:", error);
      }
      return;
    }

    const cutoff = new Date(Date.now() - pruneDays * 24 * 60 * 60 * 1000);
    try {
      const result = await this.model.deleteMany({
        updatedAt: { $lt: cutoff },
      });
      if (result.deletedCount) {
        await this.load();
        logger.info(`Pruned ${result.deletedCount} crosspost records older than ${pruneDays} days (sourceMessageId).`);
      }
    } catch (error) {
      logger.error("Failed to prune stale crosspost records:", error);
    }
  }
}

module.exports = { CrosspostStore };
