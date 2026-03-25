const express = require("express");
const {
  signup,
  verifyOtp,
  login,
  googleAuth,
} = require("../controllers/authController");

const router = express.Router();

router.post("/signup", signup);
router.post("/verify-otp", verifyOtp);
router.post("/login", login);
router.post("/google", googleAuth);

module.exports = router;