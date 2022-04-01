const mongoose = require("mongoose");

const autoreplySchema = new mongoose.model(
  "autoreply",
  new mongoose.Schema({
    id: { type: Number },
    text: { type: String },
    trigger: { type: String },
    channels: { type: Array },
  })
);

module.exports = autoreplySchema;
