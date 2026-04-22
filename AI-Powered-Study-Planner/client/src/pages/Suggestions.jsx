import React, { useEffect, useMemo, useState } from "react";
import AppLayout from "../components/layout/AppLayout";
import AppLoader from "../components/layout/AppLoader";
import useMinimumLoader from "../hooks/useMinimumLoader";
import { getStats } from "../services/statsService";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

function Suggestions() {
  const [taskCount, setTaskCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const loaderDelayDone = useMinimumLoader(500);

  const [stats, setStats] = useState({
    completedFocusSessions: 0,
    distractedEvents: 0,
    tabSwitchCount: 0,
    windowBlurCount: 0,
    warningCount: 0,
  });

  const user = JSON.parse(localStorage.getItem("user")) || {};
  const userName = user.name || "User";

  useEffect(() => {
    const loadSuggestionData = async () => {
      try {
        const token = localStorage.getItem("token");

        const [taskResponse, statsData] = await Promise.all([
          fetch(`${API_BASE_URL}/tasks`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
          getStats(),
        ]);

        const taskData = await taskResponse.json();

        if (taskResponse.ok) {
          setTaskCount(taskData.length);
        }

        setStats({
          completedFocusSessions: statsData.completedFocusSessions || 0,
          distractedEvents: statsData.distractedEvents || 0,
          tabSwitchCount: statsData.tabSwitchCount || 0,
          windowBlurCount: statsData.windowBlurCount || 0,
          warningCount: statsData.warningCount || 0,
        });
      } catch (error) {
        console.error("Failed to fetch suggestion data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadSuggestionData();
  }, []);

  const focusScore = Math.max(
    0,
    100 -
    stats.tabSwitchCount * 10 -
    stats.windowBlurCount * 5 -
    stats.warningCount * 15
  );

  const suggestions = useMemo(() => {
    const generatedSuggestions = [];

    if (taskCount === 0) {
      generatedSuggestions.push({
        title: "Define Your Study Curriculum",
        description:
          "Your planner is empty. Without a roadmap, willpower easily depletes. Break your current subject down into 3 specific, manageable tasks right now.",
        type: "info",
      });
    }

    if (stats.completedFocusSessions >= 3 && stats.distractedEvents <= 1) {
      generatedSuggestions.push({
        title: "Deep Work State Achieved - Use the Feynman Technique",
        description:
          "Your focus pattern is exceptional today. Capitalize on this high cognitive state by trying to explain your most difficult concept out loud as if teaching a child. This will instantly expose any gaps in your knowledge.",
        type: "success",
      });
    }

    if (stats.distractedEvents >= 2) {
      generatedSuggestions.push({
        title: "Implement the 20-Second Rule",
        description:
          "We noticed frequent distractions breaking your study rhythm. Make your worst distractions (like your phone or social web tabs) take at least 20 seconds to access. Adding small friction works wonders to kill impulsive habits.",
        type: "warning",
      });
    }

    if (focusScore < 60) {
      generatedSuggestions.push({
        title: "Cognitive Load Reset Required",
        description:
          "Your engagement trend is slipping. Switch from your current task to a 'Spaced Repetition' review of older material, or take a strict 15-minute away-from-screen break to clear mental fatigue.",
        type: "danger",
      });
    }

    if (focusScore >= 80 && taskCount > 0) {
      generatedSuggestions.push({
        title: "Try the Pomodoro 'Plus' Method",
        description:
          "Since your focus score is very stable, try pushing your next focus session from 25 minutes up to 50 minutes, followed by a rewarding 10-minute break. You have the momentum for longer deep-flow states.",
        type: "success",
      });
    }

    if (stats.completedFocusSessions === 0 && taskCount > 0) {
      generatedSuggestions.push({
        title: "Beat Procrastination with the '2-Minute Rule'",
        description:
          "You've planned your work, but haven't started. Trick your brain by committing to study for just 2 minutes. Usually, the friction is just in starting, and you'll naturally want to continue once you cross that hurdle.",
        type: "info",
      });
    }

    if (stats.distractedEvents >= 3 && focusScore < 50) {
      generatedSuggestions.push({
        title: "High Burnout Risk - Change Context",
        description:
          "Your distraction levels are very high and focus is dropping. Forcibly step away from your desk, get some water, or physically change your study environment (like moving to a different room) to reset your brain context.",
        type: "danger",
      });
    }

    if (taskCount >= 5 && stats.completedFocusSessions <= 1) {
      generatedSuggestions.push({
        title: "Avoid Decision Fatigue - Eat the Frog",
        description:
          "You have a lot of active tasks but low session completion. Your brain might be overwhelmed. 'Eat the Frog'—pick the single hardest task on your list and ignore everything else until it's done.",
        type: "warning",
      });
    }

    if (generatedSuggestions.length === 0) {
      generatedSuggestions.push({
        title: "Consistent Momentum",
        description:
          "Your metrics are perfectly balanced. The best strategy right now is simply maintaining your current rhythm. Keep taking water breaks and don't change what's already working.",
        type: "success",
      });
    }

    return generatedSuggestions;
  }, [taskCount, stats, focusScore]);

  const getCardStyle = (type) => {
    switch (type) {
      case "success":
        return "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800";
      case "warning":
        return "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800";
      case "danger":
        return "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800";
      default:
        return "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800";
    }
  };

  const cardClass =
    "glass-card rounded-[28px] p-6 border border-slate-200 dark:border-slate-800 transition-colors duration-300";

  if (loading || !loaderDelayDone) {
    return (
      <AppLayout
        title="AI Suggestions"
        subtitle="Adaptive study guidance based on your focus and productivity patterns"
      >
        <AppLoader message="Generating AI suggestions..." />
      </AppLayout>
    );
  }

  return (
    <AppLayout
      title="AI Suggestions"
      subtitle="Adaptive study guidance based on your focus and productivity patterns"
    >
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          <div className="glass-card lux-hero rounded-[30px] p-7">
            <h3 className="text-3xl font-black section-title">
              Hello, {userName}
            </h3>
            <p className="section-subtitle mt-3">
              These recommendations are generated from your recent planner and
              focus behavior.
            </p>
          </div>

          <div className="space-y-4">
            {suggestions.map((item, index) => (
              <div
                key={index}
                className={`border rounded-2xl p-5 shadow-sm ${getCardStyle(
                  item.type
                )}`}
              >
                <h4 className="text-xl font-black section-title">
                  {item.title}
                </h4>
                <p className="section-subtitle mt-2">{item.description}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className={cardClass}>
            <h3 className="text-2xl font-black section-title mb-4">
              AI Input Signals
            </h3>

            <div className="space-y-4">
              <div className="metric-card rounded-xl p-4">
                <p className="metric-title text-sm">Active Tasks</p>
                <p className="text-3xl font-bold metric-value mt-1">
                  {taskCount}
                </p>
              </div>

              <div className="metric-card rounded-xl p-4">
                <p className="metric-title text-sm">Focus Sessions</p>
                <p className="text-3xl font-bold text-green-600 mt-1">
                  {stats.completedFocusSessions}
                </p>
              </div>

              <div className="metric-card rounded-xl p-4">
                <p className="metric-title text-sm">Distracted Events</p>
                <p className="text-3xl font-bold text-orange-500 mt-1">
                  {stats.distractedEvents}
                </p>
              </div>

              <div className="metric-card rounded-xl p-4">
                <p className="metric-title text-sm">Focus Score</p>
                <p className="text-3xl font-bold text-blue-600 mt-1">
                  {focusScore}%
                </p>
              </div>
            </div>
          </div>

          <div className={cardClass}>
            <h3 className="text-2xl font-black section-title mb-4">
              Recommendation Logic
            </h3>

            <div className="space-y-3 text-sm section-subtitle">
              <p>• High focus + low distraction → increase challenge</p>
              <p>• High distraction → reduce session length</p>
              <p>• Low focus score → recovery suggestion</p>
              <p>• Low session completion → start with smaller targets</p>
              <p>• High distraction + low focus → burnout warning</p>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

export default Suggestions;