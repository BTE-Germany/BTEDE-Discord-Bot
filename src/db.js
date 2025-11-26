const mongoose = require("mongoose");
const logger = require("./logger");

const crosspostSchema = new mongoose.Schema(
  {
    threadId: { type: String, required: true, unique: true },
    messageId: { type: String, required: true },
    channelId: { type: String, required: true },
  },
  { timestamps: true }
);

const Crosspost = mongoose.model("Crosspost", crosspostSchema);

const connectDatabase = async (mongoUri) => {
  await mongoose.connect(mongoUri);
  logger.info("Connected to MongoDB.");
};

module.exports = { connectDatabase, Crosspost };
