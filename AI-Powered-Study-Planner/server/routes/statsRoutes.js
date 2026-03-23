const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const {
  getUserStats,
  updateUserStats,
  resetUserStats,
} = require("../controllers/statsController");

router.get("/", protect, getUserStats);
router.put("/", protect, updateUserStats);
router.post("/reset", protect, resetUserStats);

module.exports = router;