const express = require("express");
const DailyAnalytics = require("../models/DailyAnalytics");
const { protect } = require("../middleware/authMiddleware");

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

router.post("/log", protect, async (req, res) => {
  try {
    const userId = req.user.id;
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

router.get("/weekly", protect, async (req, res) => {
  try {
    const userId = req.user.id;
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

router.delete("/reset", protect, async (req, res) => {
  try {
    const userId = req.user.id;
    await DailyAnalytics.deleteMany({ user: userId });

    res.status(200).json({ message: "Daily analytics reset successfully." });
  } catch (error) {
    console.error("analytics reset error:", error);
    res.status(500).json({ message: "Failed to reset daily analytics." });
  }
});

module.exports = router;