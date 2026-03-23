import React, { useEffect, useMemo, useState } from "react";
import AppLayout from "../components/layout/AppLayout";
import { getStats } from "../services/statsService";

function Performance() {
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
    const loadPerformanceData = async () => {
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
        console.error("Failed to fetch performance data:", error);
      }
    };

    loadPerformanceData();
  }, []);

  const focusScore = Math.max(
    0,
    100 -
      stats.tabSwitchCount * 10 -
      stats.windowBlurCount * 5 -
      stats.warningCount * 15
  );

  const xp = useMemo(() => {
    const calculatedXp =
      stats.completedFocusSessions * 20 +
      taskCount * 5 -
      stats.distractedEvents * 5 -
      stats.warningCount * 3;

    return Math.max(0, calculatedXp);
  }, [stats, taskCount]);

  const streak = useMemo(() => {
    if (stats.completedFocusSessions >= 5) return 5;
    if (stats.completedFocusSessions >= 3) return 3;
    if (stats.completedFocusSessions >= 1) return 1;
    return 0;
  }, [stats.completedFocusSessions]);

  const getPerformanceRemark = () => {
    if (focusScore >= 85 && stats.distractedEvents <= 1) {
      return "Excellent focus consistency";
    }
    if (focusScore >= 65) {
      return "Good performance with room for improvement";
    }
    if (focusScore >= 45) {
      return "Moderate performance, reduce distractions";
    }
    return "Low engagement detected, recovery needed";
  };

  const getLevel = () => {
    if (xp >= 200) return "Advanced Learner";
    if (xp >= 100) return "Consistent Performer";
    if (xp >= 40) return "Rising Focuser";
    return "Beginner";
  };

  const cardClass = "glass-card rounded-[28px] p-6 border border-slate-200 dark:border-slate-800 transition-colors duration-300";

  return (
    <AppLayout
      title="Performance"
      subtitle="Review progress, focus analytics, and productivity trends"
    >
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          <div className="glass-card lux-hero rounded-[30px] p-7">
            <h3 className="text-3xl font-black section-title">
              {userName}'s Performance Hub
            </h3>
            <p className="section-subtitle mt-3">
              Analyze your current productivity signals and improvement areas.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className={cardClass}>
              <p className="metric-title text-sm">Focus Score</p>
              <h4 className="text-3xl font-bold text-blue-600 mt-2">
                {focusScore}%
              </h4>
              <p className="section-subtitle text-sm mt-2">
                {getPerformanceRemark()}
              </p>
            </div>

            <div className={cardClass}>
              <p className="metric-title text-sm">User Level</p>
              <h4 className="text-3xl font-bold text-violet-600 mt-2">
                {getLevel()}
              </h4>
              <p className="section-subtitle text-sm mt-2">
                Based on XP and focus consistency
              </p>
            </div>

            <div className={cardClass}>
              <p className="metric-title text-sm">XP Points</p>
              <h4 className="text-3xl font-bold text-amber-500 mt-2">{xp}</h4>
              <p className="section-subtitle text-sm mt-2">
                Earned from sessions, task planning, and focus
              </p>
            </div>

            <div className={cardClass}>
              <p className="metric-title text-sm">Study Streak</p>
              <h4 className="text-3xl font-bold text-rose-500 mt-2">
                {streak} day{streak === 1 ? "" : "s"}
              </h4>
              <p className="section-subtitle text-sm mt-2">
                Maintained through completed focus sessions
              </p>
            </div>
          </div>

          <div className={cardClass}>
            <h3 className="text-2xl font-black section-title mb-4">
              Performance Breakdown
            </h3>

            <div className="space-y-4">
              <div className="metric-card rounded-xl p-4 flex items-center justify-between">
                <div>
                  <p className="metric-title text-sm">Completed Focus Sessions</p>
                  <p className="text-lg font-semibold metric-value mt-1">
                    {stats.completedFocusSessions}
                  </p>
                </div>
                <span className="text-green-600 font-bold">+ Productivity</span>
              </div>

              <div className="metric-card rounded-xl p-4 flex items-center justify-between">
                <div>
                  <p className="metric-title text-sm">Active Planner Tasks</p>
                  <p className="text-lg font-semibold metric-value mt-1">
                    {taskCount}
                  </p>
                </div>
                <span className="text-blue-600 font-bold">+ Organization</span>
              </div>

              <div className="metric-card rounded-xl p-4 flex items-center justify-between">
                <div>
                  <p className="metric-title text-sm">Distracted Events</p>
                  <p className="text-lg font-semibold metric-value mt-1">
                    {stats.distractedEvents}
                  </p>
                </div>
                <span className="text-orange-500 font-bold">- Focus Quality</span>
              </div>

              <div className="metric-card rounded-xl p-4 flex items-center justify-between">
                <div>
                  <p className="metric-title text-sm">Warnings Triggered</p>
                  <p className="text-lg font-semibold metric-value mt-1">
                    {stats.warningCount}
                  </p>
                </div>
                <span className="text-red-500 font-bold">- Engagement</span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className={cardClass}>
            <h3 className="text-2xl font-black section-title mb-4">
              Behavior Metrics
            </h3>

            <div className="space-y-4">
              <div className="metric-card rounded-xl p-4">
                <p className="metric-title text-sm">Tab Switches</p>
                <p className="text-3xl font-bold metric-value mt-1">
                  {stats.tabSwitchCount}
                </p>
              </div>

              <div className="metric-card rounded-xl p-4">
                <p className="metric-title text-sm">Window Blur Events</p>
                <p className="text-3xl font-bold metric-value mt-1">
                  {stats.windowBlurCount}
                </p>
              </div>

              <div className="metric-card rounded-xl p-4">
                <p className="metric-title text-sm">Warnings</p>
                <p className="text-3xl font-bold text-orange-500 mt-1">
                  {stats.warningCount}
                </p>
              </div>
            </div>
          </div>

          <div className={cardClass}>
            <h3 className="text-2xl font-black section-title mb-4">
              Performance Insight
            </h3>

            <div className="space-y-4">
              <div className="metric-card rounded-xl p-4">
                <p className="metric-title text-sm">Consistency Status</p>
                <p className="metric-value font-semibold mt-1">
                  {streak >= 3
                    ? "Strong consistency pattern"
                    : streak >= 1
                    ? "Basic momentum established"
                    : "Consistency not yet established"}
                </p>
              </div>

              <div className="metric-card rounded-xl p-4">
                <p className="metric-title text-sm">AI Recommendation</p>
                <p className="metric-value font-semibold mt-1">
                  {focusScore < 60
                    ? "Reduce distractions and begin with shorter study sessions."
                    : "Maintain your study rhythm and build sustainable consistency."}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

export default Performance;