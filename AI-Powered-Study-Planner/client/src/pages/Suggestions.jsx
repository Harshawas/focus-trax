import React, { useEffect, useMemo, useState } from "react";
import AppLayout from "../components/layout/AppLayout";
import { getStats } from "../services/statsService";

function Suggestions() {
  const [taskCount, setTaskCount] = useState(0);
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
          fetch("http://localhost:5000/tasks", {
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
        title: "Add Study Tasks",
        description:
          "Your planner is empty. Add subjects and tasks so the system can generate meaningful study guidance.",
        type: "info",
      });
    }

    if (stats.completedFocusSessions >= 3 && stats.distractedEvents <= 1) {
      generatedSuggestions.push({
        title: "Increase Challenge Level",
        description:
          "Your focus pattern looks strong. You can increase session depth or add one more high-priority task.",
        type: "success",
      });
    }

    if (stats.distractedEvents >= 2) {
      generatedSuggestions.push({
        title: "Reduce Distractions",
        description:
          "Frequent distracted events were detected. Try shorter focus blocks and reduce external interruptions.",
        type: "warning",
      });
    }

    if (focusScore < 60) {
      generatedSuggestions.push({
        title: "Focus Score is Low",
        description:
          "Your current engagement trend is weak. Consider taking a short reset break and restarting with a smaller target.",
        type: "danger",
      });
    }

    if (focusScore >= 80 && taskCount > 0) {
      generatedSuggestions.push({
        title: "Maintain Current Rhythm",
        description:
          "Your study pattern is stable. Continue with the current schedule and maintain consistency.",
        type: "success",
      });
    }

    if (stats.completedFocusSessions === 0 && taskCount > 0) {
      generatedSuggestions.push({
        title: "Start a Focus Session",
        description:
          "You have planned tasks but no completed focus sessions yet. Start one Pomodoro cycle to begin progress.",
        type: "info",
      });
    }

    if (stats.distractedEvents >= 3 && focusScore < 50) {
      generatedSuggestions.push({
        title: "Burnout Risk Detected",
        description:
          "Your distraction level is high and focus score is dropping. Take a longer recovery break before continuing.",
        type: "danger",
      });
    }

    if (taskCount >= 5 && stats.completedFocusSessions <= 1) {
      generatedSuggestions.push({
        title: "Reduce Task Load",
        description:
          "Your current planner load may be too high compared to completed focus sessions. Break large goals into smaller tasks.",
        type: "warning",
      });
    }

    if (generatedSuggestions.length === 0) {
      generatedSuggestions.push({
        title: "Balanced Progress",
        description:
          "Your current productivity signals look balanced. Keep following your study plan.",
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
                <h4 className="text-xl font-black section-title">{item.title}</h4>
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