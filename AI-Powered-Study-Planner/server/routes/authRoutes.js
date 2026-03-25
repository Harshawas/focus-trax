const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");
const User = require("../models/User");
const sendOtpEmail = require("../utils/sendOtpEmail");

const router = express.Router();

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^()_+\-=\[\]{};':"\\|,.<>\/~`]).{8,}$/;

function generateToken(user) {
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
}

function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * STEP 1: Email signup -> send OTP
 */
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required." });
    }

    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        message:
          "Password must be at least 8 characters and include uppercase, lowercase, number, and symbol.",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existingUser = await User.findOne({ email: normalizedEmail });

    if (
      existingUser &&
      existingUser.isVerified &&
      existingUser.authProvider === "local"
    ) {
      return res
        .status(400)
        .json({ message: "User already exists. Please login." });
    }

    if (
      existingUser &&
      existingUser.isVerified &&
      existingUser.authProvider === "google"
    ) {
      return res.status(400).json({
        message: "This email is already registered with Google login.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = generateOtp();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

    if (!existingUser) {
  const newUserData = {
    name: name.trim(),
    email: normalizedEmail,
    password: hashedPassword,
    authProvider: "local",
    isVerified: false,
    otpCode: otp,
    otpExpiresAt,
  };

  if (req.body.username) {
    newUserData.username = req.body.username.toLowerCase().trim();
  }

  await User.create(newUserData);
} else {
  existingUser.name = name.trim();
  existingUser.password = hashedPassword;
  existingUser.authProvider = "local";
  existingUser.isVerified = false;
  existingUser.otpCode = otp;
  existingUser.otpExpiresAt = otpExpiresAt;

  if (req.body.username) {
    existingUser.username = req.body.username.toLowerCase().trim();
  }

  await existingUser.save();
}

    await sendOtpEmail(normalizedEmail, name.trim(), otp);

    return res.status(200).json({
      message: "OTP sent successfully to your email.",
    });
  } catch (error) {
    console.error("signup error:", error);
    return res.status(500).json({
      message: "Server error during signup initiation.",
    });
  }
});

/**
 * STEP 2: Verify OTP and activate account
 */
router.post("/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res
        .status(400)
        .json({ message: "Email and OTP are required." });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    if (user.isVerified) {
      return res
        .status(400)
        .json({ message: "Account already verified. Please login." });
    }

    if (!user.otpCode || !user.otpExpiresAt) {
      return res
        .status(400)
        .json({ message: "OTP not found. Please sign up again." });
    }

    if (new Date() > user.otpExpiresAt) {
      return res
        .status(400)
        .json({ message: "OTP expired. Please sign up again." });
    }

    if (user.otpCode !== otp.trim()) {
      return res.status(400).json({ message: "Invalid OTP." });
    }

    user.isVerified = true;
    user.otpCode = null;
    user.otpExpiresAt = null;
    await user.save();

    const token = generateToken(user);

    return res.status(200).json({
      message: "Account verified successfully.",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        authProvider: user.authProvider,
      },
    });
  } catch (error) {
    console.error("verify-otp error:", error);
    return res.status(500).json({
      message: "Server error during OTP verification.",
    });
  }
});

/**
 * Login with email/password
 */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const normalizedEmail = email?.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res
        .status(400)
        .json({ message: "Invalid email or password." });
    }

    if (user.authProvider === "google" && !user.password) {
      return res.status(400).json({
        message: "This account uses Google login. Please continue with Google.",
      });
    }

    if (!user.isVerified) {
      return res.status(400).json({
        message: "Please verify your email with OTP before logging in.",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password || "");

    if (!isMatch) {
      return res
        .status(400)
        .json({ message: "Invalid email or password." });
    }

    const token = generateToken(user);

    return res.status(200).json({
      message: "Login successful.",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        authProvider: user.authProvider,
      },
    });
  } catch (error) {
    console.error("login error:", error);
    return res.status(500).json({ message: "Server error during login." });
  }
});

/**
 * Google login/signup
 */
router.post("/google", async (req, res) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res
        .status(400)
        .json({ message: "Google credential is required." });
    }

    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    if (!payload?.email) {
      return res
        .status(400)
        .json({ message: "Unable to fetch Google account email." });
    }

    const email = payload.email.toLowerCase().trim();
    const name = payload.name || "Google User";
    const googleId = payload.sub;

    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        name,
        email,
        googleId,
        authProvider: "google",
        isVerified: true,
      });
    } else {
      user.name = user.name || name;
      user.googleId = googleId;
      if (!user.isVerified) user.isVerified = true;
      if (!user.authProvider) user.authProvider = "google";
      await user.save();
    }

    const token = generateToken(user);

    return res.status(200).json({
      message: "Google authentication successful.",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        authProvider: user.authProvider,
      },
    });
  } catch (error) {
    console.error("google auth error:", error);
    return res.status(500).json({
      message: "Google authentication failed.",
    });
  }
});

module.exports = router;