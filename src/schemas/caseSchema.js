const mongoose = require("mongoose");

const caseSchema = new mongoose.model(
  "case",
  new mongoose.Schema({
    id: { type: Number },
    timestamp: { type: Number, default: new Date().getTime() },
    end: { type: Number },
    reason: { type: String },
    type: { type: String },
    mod: { type: String },
    user: { type: String },
    usertag: { type: String, defaul: null },
    lang: { type: String, default: "both" },
    deleted: { type: Boolean, default: false },
    roles: { type: Array, default: [] },
  })
);

module.exports = caseSchema;
