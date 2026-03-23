const mongoose = require("mongoose");

const sessionStatSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    completedFocusSessions: {
      type: Number,
      default: 0,
    },
    distractedEvents: {
      type: Number,
      default: 0,
    },
    tabSwitchCount: {
      type: Number,
      default: 0,
    },
    windowBlurCount: {
      type: Number,
      default: 0,
    },
    warningCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("SessionStat", sessionStatSchema);