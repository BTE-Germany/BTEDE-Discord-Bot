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
        console.log(`Loaded ${records.length} crosspost references from database.`);
      }
    } catch (error) {
      console.error("Failed to load crosspost map from database:", error);
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
        { threadId, messageId, channelId: this.targetChannelId},
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
    } catch (error) {
      console.error(`Failed to persist crosspost mapping for thread ${threadId}:`, error);
    }
  }

  async remove(threadId) {
    this.map.delete(threadId);
    try {
      await this.model.deleteOne({ threadId });
    } catch (error) {
      console.error(`Failed to remove crosspost mapping for thread ${threadId}:`, error);
    }
  }

  async fetchMessage(thread, targetChannel) {
    const crosspostId = this.get(thread.id);
    if (!crosspostId) return null;

    try {
      return await targetChannel.messages.fetch(crosspostId);
    } catch (error) {
      if (error?.code === 10008 || error?.status === 404) {
        console.warn(`Crosspost message missing for thread ${thread.id}; cleaning up mapping.`);
        await this.remove(thread.id);
        return null;
      }
      throw error;
    }
  }
}

module.exports = { CrosspostStore };
