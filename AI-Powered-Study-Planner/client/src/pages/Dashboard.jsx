import React, { useEffect, useState } from "react";
import AppLayout from "../components/layout/AppLayout";
import AppLoader from "../components/layout/AppLoader";
import useMinimumLoader from "../hooks/useMinimumLoader";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar, Pie } from "react-chartjs-2";
import { getStats } from "../services/statsService";
import { getWeeklyAnalytics } from "../services/analyticsService";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend
);

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

function Dashboard() {
  const [userName, setUserName] = useState("User");
  const [taskCount, setTaskCount] = useState(0);
  const loaderDelayDone = useMinimumLoader(500);
  const [loading, setLoading] = useState(true);
  const [weeklyAnalytics, setWeeklyAnalytics] = useState([]);

  const [stats, setStats] = useState({
    completedFocusSessions: 0,
    distractedEvents: 0,
    tabSwitchCount: 0,
    windowBlurCount: 0,
    warningCount: 0,
  });

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user?.name) {
      setUserName(user.name);
    }

    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const token = localStorage.getItem("token");

      const [taskResponse, statsData, weeklyData] = await Promise.all([
        fetch(`${API_BASE_URL}/api/tasks`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
        getStats(),
        getWeeklyAnalytics(),
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

      setWeeklyAnalytics(weeklyData || []);
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const focusScore = Math.max(
    0,
    100 -
      stats.tabSwitchCount * 10 -
      stats.windowBlurCount * 5 -
      stats.warningCount * 15
  );

  const weeklyHours = weeklyAnalytics.map((day) =>
    Number((day.focusMinutes / 60).toFixed(2))
  );

  const isWeeklyChartEmpty =
    weeklyHours.length === 0 || weeklyHours.every((value) => value === 0);

  const weeklyLabels =
    weeklyAnalytics.length > 0
      ? weeklyAnalytics.map((day) => day.label)
      : ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  const weeklyStudyData = {
    labels: weeklyLabels,
    datasets: [
      ...(isWeeklyChartEmpty
        ? [
            {
              label: "Getting Started",
              data: weeklyLabels.map(() => 0.15),
              backgroundColor: "rgba(217, 168, 58, 0.18)",
              borderColor: "rgba(217, 168, 58, 0.28)",
              borderWidth: 1,
              borderRadius: 12,
            },
          ]
        : []),
      {
        label: "Study Hours",
        data: isWeeklyChartEmpty ? weeklyLabels.map(() => 0) : weeklyHours,
        backgroundColor: "rgba(59,130,246,0.78)",
        borderRadius: 12,
      },
    ],
  };

  const pieFocused = stats.completedFocusSessions || 0;
  const pieDistracted = stats.distractedEvents || 0;
  const isPieEmpty = pieFocused === 0 && pieDistracted === 0;

  const focusPieData = {
    labels: isPieEmpty ? ["No Activity Yet"] : ["Focused", "Distracted"],
    datasets: [
      {
        data: isPieEmpty ? [1] : [pieFocused, pieDistracted],
        backgroundColor: isPieEmpty
          ? ["rgba(217, 168, 58, 0.25)"]
          : ["#22c55e", "#f97316"],
      },
    ],
  };

  if (loading || !loaderDelayDone) {
    return (
      <AppLayout
        title="Dashboard"
        subtitle="Overview of your smart study workflow"
      >
        <AppLoader message="Loading dashboard analytics..." />
      </AppLayout>
    );
  }

  return (
    <AppLayout
      title="Dashboard"
      subtitle="Overview of your smart study workflow"
    >
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          <div className="glass-card lux-hero rounded-[32px] p-8">
            <h3 className="text-4xl font-black section-title">
              Welcome back, {userName}
            </h3>
            <p className="section-subtitle mt-3 text-lg">
              Stay focused, stay consistent, and let the system guide your study
              flow.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              ["Total Tasks", taskCount, "text-slate-900 dark:text-white"],
              [
                "Focus Sessions",
                stats.completedFocusSessions,
                "text-green-500",
              ],
              [
                "Distracted Events",
                stats.distractedEvents,
                "text-orange-500",
              ],
              ["Focus Score", `${focusScore}%`, "text-blue-500"],
            ].map(([label, value, valueClass]) => (
              <div
                key={label}
                className="metric-card rounded-[26px] p-6 shadow-lg"
              >
                <p className="metric-title text-sm">{label}</p>
                <h4 className={`text-4xl font-black mt-4 ${valueClass}`}>
                  {value}
                </h4>
              </div>
            ))}
          </div>

          <div className="glass-card rounded-[30px] p-7">
            <h3 className="text-2xl font-black section-title mb-4">
              Weekly Study Analytics
            </h3>

            <div className="h-80">
              <Bar
                data={weeklyStudyData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    y: {
                      beginAtZero: true,
                      suggestedMax: isWeeklyChartEmpty ? 1 : undefined,
                      ticks: {
                        stepSize: isWeeklyChartEmpty ? 0.5 : 1,
                        callback: function (value) {
                          return `${value}h`;
                        },
                      },
                      grid: {
                        color: "rgba(148, 163, 184, 0.15)",
                      },
                    },
                    x: {
                      grid: {
                        display: false,
                      },
                    },
                  },
                  plugins: {
                    legend: {
                      display: false,
                    },
                    tooltip: {
                      filter: function (tooltipItem) {
                        if (
                          isWeeklyChartEmpty &&
                          tooltipItem.dataset.label === "Getting Started"
                        ) {
                          return false;
                        }
                        return true;
                      },
                      callbacks: {
                        label: function (context) {
                          return `${context.parsed.y}h`;
                        },
                      },
                    },
                  },
                }}
              />
            </div>

            {isWeeklyChartEmpty && (
              <p className="section-subtitle text-sm mt-4">
                Your weekly chart will start building as you complete focus
                sessions and study activity.
              </p>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="glass-card rounded-[30px] p-7">
            <h3 className="text-2xl font-black section-title mb-4">
              Focus Analysis
            </h3>

            <div className="h-72">
              <Pie
                data={focusPieData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    tooltip: {
                      callbacks: {
                        label: function (context) {
                          if (isPieEmpty) return "No activity yet";
                          return `${context.label}: ${context.parsed}`;
                        },
                      },
                    },
                  },
                }}
              />
            </div>

            {isPieEmpty && (
              <p className="section-subtitle text-sm mt-4">
                Complete your first focus session to unlock your focus
                distribution.
              </p>
            )}
          </div>

          <div className="glass-card rounded-[30px] p-7">
            <h3 className="text-2xl font-black section-title mb-4">
              Recent Summary
            </h3>

            <div className="space-y-4">
              {[
                [
                  "Planner Status",
                  taskCount > 0
                    ? `${taskCount} active study tasks in your planner`
                    : "No active tasks yet",
                ],
                [
                  "Focus Status",
                  stats.completedFocusSessions > stats.distractedEvents
                    ? "Your focus trend looks stable"
                    : "Your distraction trend needs improvement",
                ],
                [
                  "AI Insight",
                  stats.completedFocusSessions === 0 &&
                  stats.distractedEvents === 0
                    ? "Start your first session and your analytics will begin building automatically."
                    : stats.distractedEvents >= 3
                    ? "Consider shorter focus sessions and more frequent breaks."
                    : "You are maintaining a healthy study rhythm.",
                ],
              ].map(([title, text]) => (
                <div key={title} className="metric-card rounded-[22px] p-5">
                  <p className="metric-title text-sm">{title}</p>
                  <p className="metric-value font-semibold mt-2">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

export default Dashboard;