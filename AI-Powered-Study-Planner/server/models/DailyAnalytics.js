const mongoose = require("mongoose");

const dailyAnalyticsSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    dateKey: {
      type: String,
      required: true,
      index: true,
    },
    focusMinutes: {
      type: Number,
      default: 0,
    },
    completedSessions: {
      type: Number,
      default: 0,
    },
    distractedEvents: {
      type: Number,
      default: 0,
    },
    tabSwitches: {
      type: Number,
      default: 0,
    },
    windowBlurEvents: {
      type: Number,
      default: 0,
    },
    warnings: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

dailyAnalyticsSchema.index({ user: 1, dateKey: 1 }, { unique: true });

module.exports = mongoose.model("DailyAnalytics", dailyAnalyticsSchema);