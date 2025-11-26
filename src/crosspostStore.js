const logger = require("./logger");

class CrosspostStore {
  constructor(model, targetChannelId) {
    this.model = model;
    this.targetChannelId = targetChannelId;
    this.map = new Map(); // threadId -> messageId
  }

  async load() {
    try {
      const records = await this.model.find({ channelId: this.targetChannelId }).lean();
      records.forEach((record) => this.map.set(record.threadId, record.messageId));
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

  async set(threadId, messageId) {
    this.map.set(threadId, messageId);
    try {
      await this.model.findOneAndUpdate(
        { threadId },
        { threadId, messageId, channelId: this.targetChannelId },
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

  async fetchMessage(thread, targetChannel) {
    const crosspostId = this.get(thread.id);
    if (!crosspostId) return null;

    try {
      return await targetChannel.messages.fetch(crosspostId);
    } catch (error) {
      if (error?.code === 10008 || error?.status === 404) {
        logger.warn(`Crosspost message missing for thread ${thread.id}; cleaning up mapping.`);
        await this.remove(thread.id);
        return null;
      }
      throw error;
    }
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
        let removed = 0;
        for (const [threadId] of this.map) {
          // Without timestamps in the map, conservatively drop if missing in DB.
          // We'll reload from DB after pruning to stay consistent.
          removed += 1;
        }
        this.map.clear();
        const remainingRecords = await this.model.find({ channelId: this.targetChannelId }).lean();
        remainingRecords.forEach((record) => this.map.set(record.threadId, record.messageId));
        logger.info(
          `Pruned ${result.deletedCount} crosspost records older than ${pruneDays} days. Reloaded ${remainingRecords.length} active records.`
        );
      }
    } catch (error) {
      logger.error("Failed to prune stale crosspost records:", error);
    }
  }
}

module.exports = { CrosspostStore };
