const SessionStat = require("../models/SessionStat");

const getUserStats = async (req, res) => {
  try {
    let stats = await SessionStat.findOne({ user: req.user.id });

    if (!stats) {
      stats = await SessionStat.create({ user: req.user.id });
    }

    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch stats" });
  }
};

const updateUserStats = async (req, res) => {
  try {
    const {
      completedFocusSessions,
      distractedEvents,
      tabSwitchCount,
      windowBlurCount,
      warningCount,
    } = req.body;

    let stats = await SessionStat.findOne({ user: req.user.id });

    if (!stats) {
      stats = new SessionStat({ user: req.user.id });
    }

    if (completedFocusSessions !== undefined) {
      stats.completedFocusSessions = completedFocusSessions;
    }
    if (distractedEvents !== undefined) {
      stats.distractedEvents = distractedEvents;
    }
    if (tabSwitchCount !== undefined) {
      stats.tabSwitchCount = tabSwitchCount;
    }
    if (windowBlurCount !== undefined) {
      stats.windowBlurCount = windowBlurCount;
    }
    if (warningCount !== undefined) {
      stats.warningCount = warningCount;
    }

    await stats.save();
    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: "Failed to update stats" });
  }
};

const resetUserStats = async (req, res) => {
  try {
    let stats = await SessionStat.findOne({ user: req.user.id });

    if (!stats) {
      stats = await SessionStat.create({ user: req.user.id });
    }

    stats.completedFocusSessions = 0;
    stats.distractedEvents = 0;
    stats.tabSwitchCount = 0;
    stats.windowBlurCount = 0;
    stats.warningCount = 0;

    await stats.save();
    res.json({ message: "Stats reset successfully", stats });
  } catch (error) {
    res.status(500).json({ message: "Failed to reset stats" });
  }
};

module.exports = {
  getUserStats,
  updateUserStats,
  resetUserStats,
};