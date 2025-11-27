const logger = require("./logger");

class ThreadColorStore {
  constructor(model) {
    this.model = model;
    this.cache = new Map(); // threadId -> color
  }

  randomColor() {
    const randomByte = () => Math.floor(Math.random() * 256);
    const toHex = (n) => n.toString(16).padStart(2, "0");
    return `#${toHex(randomByte())}${toHex(randomByte())}${toHex(randomByte())}`;
  }

  async get(threadId) {
    if (this.cache.has(threadId)) return this.cache.get(threadId);
    try {
      const record = await this.model.findOne({ threadId }).lean();
      if (record?.color) {
        this.cache.set(threadId, record.color);
        return record.color;
      }
    } catch (error) {
      logger.error(`Failed to load color for thread ${threadId}:`, error);
    }
    return null;
  }

  async ensure(threadId) {
    const cached = await this.get(threadId);
    if (cached) return cached;

    const color = this.randomColor();
    try {
      await this.model.findOneAndUpdate(
        { threadId },
        { threadId, color },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      this.cache.set(threadId, color);
      return color;
    } catch (error) {
      logger.error(`Failed to set color for thread ${threadId}:`, error);
      return color; // still return the generated color
    }
  }

  async delete(threadId) {
    this.cache.delete(threadId);
    try {
      await this.model.deleteOne({ threadId });
    } catch (error) {
      logger.error(`Failed to delete color for thread ${threadId}:`, error);
    }
  }
}

module.exports = { ThreadColorStore };
