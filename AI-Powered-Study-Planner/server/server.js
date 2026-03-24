require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const taskRoutes = require("./routes/taskRoutes");
const statsRoutes = require("./routes/statsRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");
const profileRoutes = require("./routes/profileRoutes");

const app = express();

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI;

if (!MONGO_URI) {
  console.error("MongoDB URI missing in environment variables.");
  process.exit(1);
}

const allowedOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  process.env.CLIENT_URL,
].filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("CORS not allowed for this origin"));
    },
    credentials: true,
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.status(200).json({
    message: "Focus Trax backend is running.",
  });
});

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    app: "Focus Trax API",
  });
});

/* Routes */
app.use("/api/auth", authRoutes);
app.use("/tasks", taskRoutes);
app.use("/api/stats", statsRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/profile", profileRoutes);

/* 404 handler */
app.use((req, res) => {
  res.status(404).json({
    message: "Route not found",
  });
});

/* Global error handler */
app.use((err, req, res, next) => {
  console.error("Server error:", err.message);

  if (err.message && err.message.includes("CORS")) {
    return res.status(403).json({
      message: "CORS blocked for this origin",
    });
  }

  res.status(500).json({
    message: "Internal server error",
  });
});

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("MongoDB connected successfully");

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  });