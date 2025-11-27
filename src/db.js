const mongoose = require("mongoose");
const logger = require("./logger");

const crosspostSchema = new mongoose.Schema(
    {
        sourceMessageId: {type: String, required: true, unique: true}, // threadId for starters, messageId for replies
        threadId: {type: String, required: true, index: true},
        embedMessageId: {type: String},
        contentMessageId: {type: String},
    },
    {
        timestamps: true,
        versionKey: false
    }
);

const Crosspost = mongoose.model("Crosspost", crosspostSchema);

const threadColorSchema = new mongoose.Schema(
    {
        threadId: {type: String, required: true, unique: true},
        color: {type: String, required: true},
    },
    {
        timestamps: true,
        versionKey: false
    }
);

const ThreadColor = mongoose.model("ThreadColor", threadColorSchema);

const connectDatabase = async (mongoUri) => {
    await mongoose.connect(mongoUri);
    logger.info("Connected to MongoDB.");
};

module.exports = {connectDatabase, Crosspost, ThreadColor};
