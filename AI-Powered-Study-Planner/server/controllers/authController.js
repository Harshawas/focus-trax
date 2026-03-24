const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const { OAuth2Client } = require("google-auth-library");
const User = require("../models/User");

const otpStore = new Map();

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });

    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    otpStore.set(email.toLowerCase(), {
      name,
      email: email.toLowerCase(),
      password,
      otp,
      expiresAt: Date.now() + 10 * 60 * 1000,
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Focus Trax OTP Verification",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>Focus Trax Account Verification</h2>
          <p>Your OTP for account verification is:</p>
          <h1 style="letter-spacing: 4px; color: #d89b1d;">${otp}</h1>
          <p>This OTP will expire in 10 minutes.</p>
        </div>
      `,
    });

    return res.status(200).json({
      message: "OTP sent successfully to your email.",
    });
  } catch (error) {
    console.error("Signup initiation error:", error);
    return res.status(500).json({
      message: "Server error during signup initiation",
    });
  }
};

const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP are required" });
    }

    const record = otpStore.get(email.toLowerCase());

    if (!record) {
      return res.status(400).json({ message: "No OTP request found for this email" });
    }

    if (Date.now() > record.expiresAt) {
      otpStore.delete(email.toLowerCase());
      return res.status(400).json({ message: "OTP expired" });
    }

    if (record.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    const hashedPassword = await bcrypt.hash(record.password, 10);

    const user = await User.create({
      name: record.name,
      email: record.email,
      password: hashedPassword,
      authProvider: "local",
    });

    otpStore.delete(email.toLowerCase());

    return res.status(201).json({
      message: "Signup successful",
      token: generateToken(user._id),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl || "",
      },
    });
  } catch (error) {
    console.error("OTP verification error:", error);
    return res.status(500).json({
      message: "OTP verification failed",
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user || !user.password) {
      return res.status(400).json({
        message: "Invalid credentials",
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(400).json({
        message: "Invalid credentials",
      });
    }

    return res.status(200).json({
      message: "Login successful",
      token: generateToken(user._id),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl || "",
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({
      message: "Login failed",
    });
  }
};

const googleAuth = async (req, res) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({ message: "Google credential missing" });
    }

    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    const email = payload.email.toLowerCase();
    const name = payload.name;
    const picture = payload.picture || "";

    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        name,
        email,
        password: null,
        avatarUrl: picture,
        authProvider: "google",
      });
    } else {
      let changed = false;

      if (!user.avatarUrl && picture) {
        user.avatarUrl = picture;
        changed = true;
      }

      if (!user.authProvider) {
        user.authProvider = "google";
        changed = true;
      }

      if (changed) {
        await user.save();
      }
    }

    return res.status(200).json({
      message: "Google authentication successful",
      token: generateToken(user._id),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl || "",
      },
    });
  } catch (error) {
    console.error("Google auth error:", error);
    return res.status(500).json({
      message: "Google login failed",
    });
  }
};

module.exports = {
  signup,
  verifyOtp,
  login,
  googleAuth,
};