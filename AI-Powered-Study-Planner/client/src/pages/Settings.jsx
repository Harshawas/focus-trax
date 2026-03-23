import React, { useEffect, useState } from "react";
import AppLayout from "../components/layout/AppLayout";
import { resetStats } from "../services/statsService";
import { resetDailyAnalytics } from "../services/analyticsService";

function Settings() {
  const user = JSON.parse(localStorage.getItem("user")) || {};

  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");
  const [focusDuration, setFocusDuration] = useState(
    Number(localStorage.getItem("focusDuration")) || 25
  );
  const [breakDuration, setBreakDuration] = useState(
    Number(localStorage.getItem("breakDuration")) || 5
  );
  const [notifications, setNotifications] = useState(
    localStorage.getItem("notifications") === "true"
  );
  const [webcamMonitoring, setWebcamMonitoring] = useState(
    localStorage.getItem("webcamMonitoring") !== "false"
  );
  const [tabTracking, setTabTracking] = useState(
    localStorage.getItem("tabTracking") !== "false"
  );
  const [idleTracking, setIdleTracking] = useState(
    localStorage.getItem("idleTracking") !== "false"
  );
  const [autoStartBreaks, setAutoStartBreaks] = useState(
    localStorage.getItem("autoStartBreaks") === "true"
  );
  const [autoStartFocus, setAutoStartFocus] = useState(
    localStorage.getItem("autoStartFocus") === "true"
  );
  const [dailyGoal, setDailyGoal] = useState(
    Number(localStorage.getItem("dailyGoal")) || 4
  );
  const [burnoutSensitivity, setBurnoutSensitivity] = useState(
    localStorage.getItem("burnoutSensitivity") || "medium"
  );
  const [savedMessage, setSavedMessage] = useState("");

  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  const handleSaveSettings = () => {
    localStorage.setItem("theme", theme);
    localStorage.setItem("focusDuration", focusDuration);
    localStorage.setItem("breakDuration", breakDuration);
    localStorage.setItem("notifications", notifications);
    localStorage.setItem("webcamMonitoring", webcamMonitoring);
    localStorage.setItem("tabTracking", tabTracking);
    localStorage.setItem("idleTracking", idleTracking);
    localStorage.setItem("autoStartBreaks", autoStartBreaks);
    localStorage.setItem("autoStartFocus", autoStartFocus);
    localStorage.setItem("dailyGoal", dailyGoal);
    localStorage.setItem("burnoutSensitivity", burnoutSensitivity);

    setSavedMessage("Settings saved successfully.");
    setTimeout(() => setSavedMessage(""), 2500);
  };

 const handleResetAnalytics = async () => {
  try {
    await Promise.all([resetStats(), resetDailyAnalytics()]);
    setSavedMessage("Analytics reset successfully.");
    setTimeout(() => setSavedMessage(""), 2500);
  } catch (error) {
    console.error("Failed to reset analytics:", error);
    setSavedMessage("Failed to reset analytics.");
    setTimeout(() => setSavedMessage(""), 2500);
  }
};

  const cardClass =
    "glass-card rounded-[28px] p-6 border border-slate-200 dark:border-slate-800 transition-colors duration-300";

  const inputClass = "lux-input";

  return (
    <AppLayout
      title="Settings"
      subtitle="Customize your app behavior, appearance, and monitoring preferences"
    >
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          <div className={cardClass}>
            <h3 className="text-2xl font-black section-title">Profile</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              <div>
                <label className="block text-sm label-text mb-2">Full Name</label>
                <input
                  value={user.name || ""}
                  disabled
                  className={`${inputClass} opacity-70 cursor-not-allowed`}
                />
              </div>
              <div>
                <label className="block text-sm label-text mb-2">Email</label>
                <input
                  value={user.email || ""}
                  disabled
                  className={`${inputClass} opacity-70 cursor-not-allowed`}
                />
              </div>
            </div>
          </div>

          <div className={cardClass}>
            <h3 className="text-2xl font-black section-title">Appearance</h3>
            <div className="mt-6">
              <label className="block text-sm label-text mb-2">Theme Mode</label>
              <select
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                className={inputClass}
              >
                <option value="light">Light Theme</option>
                <option value="dark">Dark Theme</option>
              </select>
            </div>
          </div>

          <div className={cardClass}>
            <h3 className="text-2xl font-black section-title">Focus Preferences</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              <div>
                <label className="block text-sm label-text mb-2">
                  Focus Duration (minutes)
                </label>
                <input
                  type="number"
                  min="15"
                  max="90"
                  value={focusDuration}
                  onChange={(e) => setFocusDuration(Number(e.target.value))}
                  className={inputClass}
                />
              </div>

              <div>
                <label className="block text-sm label-text mb-2">
                  Break Duration (minutes)
                </label>
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={breakDuration}
                  onChange={(e) => setBreakDuration(Number(e.target.value))}
                  className={inputClass}
                />
              </div>
            </div>

            <div className="space-y-4 mt-6">
              <label className="flex items-center justify-between metric-card rounded-xl p-4">
                <span className="metric-value font-medium">Auto Start Breaks</span>
                <input
                  type="checkbox"
                  checked={autoStartBreaks}
                  onChange={(e) => setAutoStartBreaks(e.target.checked)}
                  className="w-5 h-5"
                />
              </label>

              <label className="flex items-center justify-between metric-card rounded-xl p-4">
                <span className="metric-value font-medium">Auto Start Next Focus Session</span>
                <input
                  type="checkbox"
                  checked={autoStartFocus}
                  onChange={(e) => setAutoStartFocus(e.target.checked)}
                  className="w-5 h-5"
                />
              </label>
            </div>
          </div>

          <div className={cardClass}>
            <h3 className="text-2xl font-black section-title">Monitoring & Privacy</h3>

            <div className="space-y-4 mt-6">
              <label className="flex items-center justify-between metric-card rounded-xl p-4">
                <span className="metric-value font-medium">Enable Notifications</span>
                <input
                  type="checkbox"
                  checked={notifications}
                  onChange={(e) => setNotifications(e.target.checked)}
                  className="w-5 h-5"
                />
              </label>

              <label className="flex items-center justify-between metric-card rounded-xl p-4">
                <span className="metric-value font-medium">Enable Webcam Monitoring</span>
                <input
                  type="checkbox"
                  checked={webcamMonitoring}
                  onChange={(e) => setWebcamMonitoring(e.target.checked)}
                  className="w-5 h-5"
                />
              </label>

              <label className="flex items-center justify-between metric-card rounded-xl p-4">
                <span className="metric-value font-medium">Enable Tab Switch Tracking</span>
                <input
                  type="checkbox"
                  checked={tabTracking}
                  onChange={(e) => setTabTracking(e.target.checked)}
                  className="w-5 h-5"
                />
              </label>

              <label className="flex items-center justify-between metric-card rounded-xl p-4">
                <span className="metric-value font-medium">Enable Idle Tracking</span>
                <input
                  type="checkbox"
                  checked={idleTracking}
                  onChange={(e) => setIdleTracking(e.target.checked)}
                  className="w-5 h-5"
                />
              </label>
            </div>
          </div>

          <div className={cardClass}>
            <h3 className="text-2xl font-black section-title">
              Productivity Preferences
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              <div>
                <label className="block text-sm label-text mb-2">
                  Daily Goal (hours)
                </label>
                <input
                  type="number"
                  min="1"
                  max="16"
                  value={dailyGoal}
                  onChange={(e) => setDailyGoal(Number(e.target.value))}
                  className={inputClass}
                />
              </div>

              <div>
                <label className="block text-sm label-text mb-2">
                  Burnout Sensitivity
                </label>
                <select
                  value={burnoutSensitivity}
                  onChange={(e) => setBurnoutSensitivity(e.target.value)}
                  className={inputClass}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <button
              onClick={handleSaveSettings}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition"
            >
              Save Settings
            </button>

            <button
              onClick={handleResetAnalytics}
              className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-xl font-semibold transition"
            >
              Reset Analytics
            </button>

            {savedMessage && (
              <p className="text-green-600 dark:text-green-400 font-medium">
                {savedMessage}
              </p>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className={cardClass}>
            <h3 className="text-2xl font-black section-title mb-4">
              Current Preferences
            </h3>

            <div className="space-y-4">
              <div className="metric-card rounded-xl p-4">
                <p className="metric-title text-sm">Theme</p>
                <p className="metric-value font-semibold mt-1 capitalize">{theme}</p>
              </div>

              <div className="metric-card rounded-xl p-4">
                <p className="metric-title text-sm">Focus / Break</p>
                <p className="metric-value font-semibold mt-1">
                  {focusDuration} min / {breakDuration} min
                </p>
              </div>

              <div className="metric-card rounded-xl p-4">
                <p className="metric-title text-sm">Daily Goal</p>
                <p className="metric-value font-semibold mt-1">{dailyGoal} hours</p>
              </div>
            </div>
          </div>

          <div className={cardClass}>
            <h3 className="text-2xl font-black section-title mb-4">
              Recommendations
            </h3>
            <div className="space-y-3 text-sm section-subtitle">
              <p>• Use dark mode for longer study sessions at night.</p>
              <p>• Shorter sessions help if distractions are frequent.</p>
              <p>• Keep webcam and tab tracking on for better focus analytics.</p>
              <p>• Higher burnout sensitivity is useful during intense study weeks.</p>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

export default Settings;