import React, { useState } from "react";
import AppLayout from "../components/layout/AppLayout";
import AppLoader from "../components/layout/AppLoader";
import useMinimumLoader from "../hooks/useMinimumLoader";
import { resetStats } from "../services/statsService";
import { resetDailyAnalytics } from "../services/analyticsService";
import { addNotification } from "../services/notificationService";

function getInitialSettings() {
  const savedThemeRaw = localStorage.getItem("theme") || "light";
  const normalizedTheme = /dark/i.test(savedThemeRaw) ? "dark" : "light";

  return {
    theme: normalizedTheme,
    focusDuration: Number(localStorage.getItem("focusDuration")) || 25,
    breakDuration: Number(localStorage.getItem("breakDuration")) || 5,
    dailyGoal: Number(localStorage.getItem("dailyGoal")) || 4,
    notifications: localStorage.getItem("notifications") === "true",
    webcamMonitoring: localStorage.getItem("webcamMonitoring") !== "false",
    tabTracking: localStorage.getItem("tabTracking") !== "false",
    idleTracking: localStorage.getItem("idleTracking") !== "false",
    autoStartBreaks: localStorage.getItem("autoStartBreaks") === "true",
    autoStartFocus: localStorage.getItem("autoStartFocus") === "true",
  };
}

function Settings() {
  const loaderDelayDone = useMinimumLoader(500);
  const [savedMessage, setSavedMessage] = useState("");
  const [settings, setSettings] = useState(() => getInitialSettings());

  const applyTheme = (themeValue) => {
    const normalizedTheme = /dark/i.test(themeValue) ? "dark" : "light";

    localStorage.setItem("theme", normalizedTheme);
    document.documentElement.dataset.theme = normalizedTheme;

    if (normalizedTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  const handleChange = (key, value) => {
    const updatedSettings = {
      ...settings,
      [key]: value,
    };

    setSettings(updatedSettings);

    if (key === "theme") {
      const normalizedTheme = /dark/i.test(value) ? "dark" : "light";
      applyTheme(normalizedTheme);
      return;
    }

    localStorage.setItem(key, String(value));
  };

  const handleSaveAll = () => {
    const normalizedTheme = /dark/i.test(settings.theme) ? "dark" : "light";

    localStorage.setItem("theme", normalizedTheme);
    localStorage.setItem("focusDuration", String(settings.focusDuration));
    localStorage.setItem("breakDuration", String(settings.breakDuration));
    localStorage.setItem("dailyGoal", String(settings.dailyGoal));
    localStorage.setItem("notifications", String(settings.notifications));
    localStorage.setItem("webcamMonitoring", String(settings.webcamMonitoring));
    localStorage.setItem("tabTracking", String(settings.tabTracking));
    localStorage.setItem("idleTracking", String(settings.idleTracking));
    localStorage.setItem("autoStartBreaks", String(settings.autoStartBreaks));
    localStorage.setItem("autoStartFocus", String(settings.autoStartFocus));

    applyTheme(normalizedTheme);

    setSavedMessage("Settings saved successfully.");

    addNotification({
      title: "Settings Saved",
      message: "Your app preferences have been updated.",
      type: "success",
    });

    setTimeout(() => setSavedMessage(""), 2200);
  };

  const handleResetAnalytics = async () => {
    try {
      await Promise.all([resetStats(), resetDailyAnalytics()]);

      setSavedMessage("Analytics reset successfully.");

      addNotification({
        title: "Analytics Reset",
        message: "Your stats and daily analytics history were cleared.",
        type: "warning",
      });

      setTimeout(() => setSavedMessage(""), 2200);
    } catch (error) {
      console.error("Failed to reset analytics:", error);
      setSavedMessage("Failed to reset analytics.");
      setTimeout(() => setSavedMessage(""), 2200);
    }
  };

  const cardClass =
    "glass-card rounded-[28px] p-6 border border-slate-200 dark:border-slate-800 transition-colors duration-300";

  const inputClass = "lux-input";
  const currentTheme = settings.theme === "dark" ? "Dark" : "Light";

  if (!loaderDelayDone) {
    return (
      <AppLayout
        title="Settings"
        subtitle="Customize your app behavior, appearance, and monitoring preferences"
      >
        <AppLoader message="Loading settings..." />
      </AppLayout>
    );
  }

  return (
    <AppLayout
      title="Settings"
      subtitle="Customize your app behavior, appearance, and monitoring preferences"
    >
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          <div className="glass-card lux-hero rounded-[30px] p-7">
            <h3 className="text-3xl font-black section-title">
              Settings Control Center
            </h3>
            <p className="section-subtitle mt-3">
              Personalize your theme, timer behavior, study goals, and monitoring preferences.
            </p>
          </div>

          <div className={cardClass}>
            <h3 className="text-2xl font-black section-title">Appearance</h3>

            <div className="mt-6">
              <label className="block text-sm label-text mb-2">Theme Mode</label>
              <select
                value={settings.theme}
                onChange={(e) => handleChange("theme", e.target.value)}
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
                  min="1"
                  value={settings.focusDuration}
                  onChange={(e) =>
                    handleChange("focusDuration", Number(e.target.value))
                  }
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
                  value={settings.breakDuration}
                  onChange={(e) =>
                    handleChange("breakDuration", Number(e.target.value))
                  }
                  className={inputClass}
                />
              </div>

              <div>
                <label className="block text-sm label-text mb-2">
                  Daily Goal (hours)
                </label>
                <input
                  type="number"
                  min="1"
                  value={settings.dailyGoal}
                  onChange={(e) =>
                    handleChange("dailyGoal", Number(e.target.value))
                  }
                  className={inputClass}
                />
              </div>
            </div>
          </div>

          <div className={cardClass}>
            <h3 className="text-2xl font-black section-title">Automation</h3>

            <div className="mt-6 space-y-4">
              <ToggleRow
                label="Auto Start Breaks"
                checked={settings.autoStartBreaks}
                onChange={(value) => handleChange("autoStartBreaks", value)}
              />

              <ToggleRow
                label="Auto Start Next Focus Session"
                checked={settings.autoStartFocus}
                onChange={(value) => handleChange("autoStartFocus", value)}
              />
            </div>
          </div>

          <div className={cardClass}>
            <h3 className="text-2xl font-black section-title">Monitoring & Privacy</h3>

            <div className="mt-6 space-y-4">
              <ToggleRow
                label="Enable Notifications"
                checked={settings.notifications}
                onChange={(value) => handleChange("notifications", value)}
              />

              <ToggleRow
                label="Enable Webcam Monitoring"
                checked={settings.webcamMonitoring}
                onChange={(value) => handleChange("webcamMonitoring", value)}
              />

              <ToggleRow
                label="Enable Tab Switch Tracking"
                checked={settings.tabTracking}
                onChange={(value) => handleChange("tabTracking", value)}
              />

              <ToggleRow
                label="Enable Idle Tracking"
                checked={settings.idleTracking}
                onChange={(value) => handleChange("idleTracking", value)}
              />
            </div>
          </div>

          <div className={cardClass}>
            <h3 className="text-2xl font-black section-title">Analytics Controls</h3>

            <div className="mt-6 flex flex-wrap gap-4">
              <button
                onClick={handleSaveAll}
                className="bg-gradient-to-r from-amber-500 to-yellow-500 text-white px-6 py-3 rounded-xl font-semibold transition"
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
                <p className="self-center font-medium text-green-600 dark:text-green-400">
                  {savedMessage}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className={cardClass}>
            <h3 className="text-2xl font-black section-title mb-4">
              Current Preferences
            </h3>

            <div className="space-y-4">
              <InfoCard label="Theme" value={currentTheme} />
              <InfoCard
                label="Focus / Break"
                value={`${settings.focusDuration} min / ${settings.breakDuration} min`}
              />
              <InfoCard
                label="Daily Goal"
                value={`${settings.dailyGoal} hour${settings.dailyGoal > 1 ? "s" : ""}`}
              />
            </div>
          </div>

          <div className={cardClass}>
            <h3 className="text-2xl font-black section-title mb-4">
              Recommendations
            </h3>

            <div className="space-y-3 section-subtitle">
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

function ToggleRow({ label, checked, onChange }) {
  return (
    <div className="metric-card rounded-[22px] px-5 py-4 flex items-center justify-between">
      <p className="font-semibold metric-value">{label}</p>

      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative w-14 h-8 rounded-full transition ${
          checked
            ? "bg-gradient-to-r from-amber-500 to-yellow-500"
            : "bg-slate-300 dark:bg-slate-700"
        }`}
      >
        <span
          className={`absolute top-1 w-6 h-6 rounded-full bg-white transition ${
            checked ? "left-7" : "left-1"
          }`}
        />
      </button>
    </div>
  );
}

function InfoCard({ label, value }) {
  return (
    <div className="metric-card rounded-xl p-4">
      <p className="metric-title text-sm">{label}</p>
      <p className="metric-value font-semibold mt-1">{value}</p>
    </div>
  );
}

export default Settings;