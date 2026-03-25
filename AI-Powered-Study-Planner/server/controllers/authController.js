const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");
const User = require("../models/User");
const sendOtpEmail = require("../utils/sendOtpEmail");

const otpStore = new Map();

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^()_+\-=\[\]{};':"\\|,.<>\/~`]).{8,}$/;

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

const signup = async (req, res) => {
  try {
    const { name, email, password, username } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "All fields are required.",
      });
    }

    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        message:
          "Password must be at least 8 characters and include uppercase, lowercase, number, and symbol.",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const normalizedUsername = username
      ? username.toLowerCase().trim()
      : undefined;

    const existingVerifiedUser = await User.findOne({
      email: normalizedEmail,
      isVerified: true,
    });

    if (
      existingVerifiedUser &&
      existingVerifiedUser.authProvider === "local"
    ) {
      return res.status(400).json({
        message: "User already exists. Please login.",
      });
    }

    if (
      existingVerifiedUser &&
      existingVerifiedUser.authProvider === "google"
    ) {
      return res.status(400).json({
        message: "This email is already registered with Google login.",
      });
    }

    if (normalizedUsername) {
      const existingUsername = await User.findOne({
        username: normalizedUsername,
        email: { $ne: normalizedEmail },
      });

      if (existingUsername) {
        return res.status(400).json({
          message: "Username is already taken.",
        });
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    otpStore.set(normalizedEmail, {
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      username: normalizedUsername,
      otp,
      expiresAt: Date.now() + 10 * 60 * 1000,
    });

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
};

const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        message: "Email and OTP are required.",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const pendingSignup = otpStore.get(normalizedEmail);

    if (!pendingSignup) {
      return res.status(400).json({
        message: "No OTP request found. Please sign up again.",
      });
    }

    if (Date.now() > pendingSignup.expiresAt) {
      otpStore.delete(normalizedEmail);
      return res.status(400).json({
        message: "OTP expired. Please sign up again.",
      });
    }

    if (pendingSignup.otp !== otp.trim()) {
      return res.status(400).json({
        message: "Invalid OTP.",
      });
    }

    let user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      const newUserData = {
        name: pendingSignup.name,
        email: pendingSignup.email,
        password: pendingSignup.password,
        authProvider: "local",
        isVerified: true,
      };

      if (pendingSignup.username) {
        newUserData.username = pendingSignup.username;
      }

      user = await User.create(newUserData);
    } else {
      user.name = pendingSignup.name;
      user.password = pendingSignup.password;
      user.authProvider = "local";
      user.isVerified = true;

      if (pendingSignup.username) {
        user.username = pendingSignup.username;
      }

      user.otpCode = null;
      user.otpExpiresAt = null;

      await user.save();
    }

    otpStore.delete(normalizedEmail);

    const token = generateToken(user._id);

    return res.status(200).json({
      message: "Account verified successfully.",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        username: user.username || "",
        avatarUrl: user.avatarUrl || "",
        authProvider: user.authProvider,
      },
    });
  } catch (error) {
    console.error("verify-otp error:", error);
    return res.status(500).json({
      message: "Server error during OTP verification.",
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const normalizedEmail = email?.toLowerCase().trim();

    if (!normalizedEmail || !password) {
      return res.status(400).json({
        message: "Email and password are required.",
      });
    }

    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(400).json({
        message: "Invalid email or password.",
      });
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
      return res.status(400).json({
        message: "Invalid email or password.",
      });
    }

    const token = generateToken(user._id);

    return res.status(200).json({
      message: "Login successful.",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        username: user.username || "",
        avatarUrl: user.avatarUrl || "",
        authProvider: user.authProvider,
      },
    });
  } catch (error) {
    console.error("login error:", error);
    return res.status(500).json({
      message: "Server error during login.",
    });
  }
};

const googleAuth = async (req, res) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({
        message: "Google credential is required.",
      });
    }

    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    if (!payload?.email) {
      return res.status(400).json({
        message: "Unable to fetch Google account email.",
      });
    }

    const email = payload.email.toLowerCase().trim();
    const name = payload.name || "Google User";
    const googleId = payload.sub;
    const picture = payload.picture || "";

    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        name,
        email,
        googleId,
        authProvider: "google",
        isVerified: true,
        avatarUrl: picture,
      });
    } else {
      user.name = user.name || name;
      user.googleId = googleId;
      user.authProvider = "google";
      user.isVerified = true;

      if (!user.avatarUrl && picture) {
        user.avatarUrl = picture;
      }

      await user.save();
    }

    const token = generateToken(user._id);

    return res.status(200).json({
      message: "Google authentication successful.",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        username: user.username || "",
        avatarUrl: user.avatarUrl || "",
        authProvider: user.authProvider,
      },
    });
  } catch (error) {
    console.error("google auth error:", error);
    return res.status(500).json({
      message: "Google authentication failed.",
    });
  }
};

module.exports = {
  signup,
  verifyOtp,
  login,
  googleAuth,
};