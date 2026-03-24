const express = require("express");
const streamifier = require("streamifier");
const User = require("../models/User");
const { protect } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");
const cloudinary = require("../config/cloudinary");

const router = express.Router();

router.get("/", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select(
      "name username email avatarUrl age linkedinUrl bio authProvider"
    );

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error("profile get error:", error);
    res.status(500).json({ message: "Failed to fetch profile." });
  }
});

router.put("/", protect, async (req, res) => {
  try {
    const { name, username, avatarUrl, age, linkedinUrl, bio } = req.body;

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    if (username) {
      const normalizedUsername = username.trim().toLowerCase();

      const existingUsername = await User.findOne({
        username: normalizedUsername,
        _id: { $ne: user._id },
      });

      if (existingUsername) {
        return res.status(400).json({ message: "Username already taken." });
      }

      user.username = normalizedUsername;
    } else {
      user.username = null;
    }

    if (typeof name === "string") {
      user.name = name.trim() || user.name;
    }

    if (typeof avatarUrl === "string") {
      user.avatarUrl = avatarUrl.trim();
    }

    user.linkedinUrl = typeof linkedinUrl === "string" ? linkedinUrl.trim() : "";
    user.bio = typeof bio === "string" ? bio.trim() : "";
    user.age = age ? Number(age) : null;

    await user.save();

    res.status(200).json({
      message: "Profile updated successfully.",
      user: {
        id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        avatarUrl: user.avatarUrl,
        age: user.age,
        linkedinUrl: user.linkedinUrl,
        bio: user.bio,
        authProvider: user.authProvider,
      },
    });
  } catch (error) {
    console.error("profile update error:", error);
    res.status(500).json({ message: "Failed to update profile." });
  }
});

router.post("/avatar", protect, upload.single("avatar"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No image file uploaded." });
    }

    const uploadFromBuffer = () =>
      new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: "focus-trax/avatars",
            resource_type: "image",
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );

        streamifier.createReadStream(req.file.buffer).pipe(stream);
      });

    const result = await uploadFromBuffer();

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    user.avatarUrl = result.secure_url;
    await user.save();

    res.status(200).json({
      message: "Avatar uploaded successfully.",
      avatarUrl: user.avatarUrl,
    });
  } catch (error) {
    console.error("avatar upload error:", error);
    res.status(500).json({ message: "Failed to upload avatar." });
  }
});

module.exports = router;