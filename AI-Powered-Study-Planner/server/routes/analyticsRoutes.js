const express = require("express");
const DailyAnalytics = require("../models/DailyAnalytics");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

function getDateKey(date = new Date()) {
  return date.toISOString().split("T")[0];
}

function getLast7Days() {
  const days = [];
  const today = new Date();

  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);

    const dateKey = getDateKey(d);
    const label = d.toLocaleDateString("en-US", { weekday: "short" });

    days.push({ dateKey, label });
  }

  return days;
}

/**
 * Log today's analytics increments
 * body example:
 * {
 *   focusMinutes: 25,
 *   completedSessions: 1,
 *   distractedEvents: 1,
 *   tabSwitches: 1,
 *   windowBlurEvents: 1,
 *   warnings: 1
 * }
 */
router.post("/log", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const dateKey = getDateKey();

    const {
      focusMinutes = 0,
      completedSessions = 0,
      distractedEvents = 0,
      tabSwitches = 0,
      windowBlurEvents = 0,
      warnings = 0,
    } = req.body;

    const analytics = await DailyAnalytics.findOneAndUpdate(
      { user: userId, dateKey },
      {
        $inc: {
          focusMinutes,
          completedSessions,
          distractedEvents,
          tabSwitches,
          windowBlurEvents,
          warnings,
        },
      },
      {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true,
      }
    );

    res.status(200).json(analytics);
  } catch (error) {
    console.error("analytics log error:", error);
    res.status(500).json({ message: "Failed to log analytics." });
  }
});

/**
 * Get last 7 days analytics for current user
 */
router.get("/weekly", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const days = getLast7Days();
    const dateKeys = days.map((d) => d.dateKey);

    const records = await DailyAnalytics.find({
      user: userId,
      dateKey: { $in: dateKeys },
    }).lean();

    const map = new Map(records.map((r) => [r.dateKey, r]));

    const weekly = days.map((day) => {
      const record = map.get(day.dateKey);

      return {
        label: day.label,
        dateKey: day.dateKey,
        focusMinutes: record?.focusMinutes || 0,
        completedSessions: record?.completedSessions || 0,
        distractedEvents: record?.distractedEvents || 0,
        tabSwitches: record?.tabSwitches || 0,
        windowBlurEvents: record?.windowBlurEvents || 0,
        warnings: record?.warnings || 0,
      };
    });

    res.status(200).json(weekly);
  } catch (error) {
    console.error("weekly analytics error:", error);
    res.status(500).json({ message: "Failed to fetch weekly analytics." });
  }
});

/**
 * Reset all daily analytics history for current user
 */
router.delete("/reset", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    await DailyAnalytics.deleteMany({ user: userId });

    res.status(200).json({ message: "Daily analytics reset successfully." });
  } catch (error) {
    console.error("analytics reset error:", error);
    res.status(500).json({ message: "Failed to reset daily analytics." });
  }
});

module.exports = router;