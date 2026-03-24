import React, { useEffect, useMemo, useState } from "react";
import AppLayout from "../components/layout/AppLayout";
import AppLoader from "../components/layout/AppLoader";
import useMinimumLoader from "../hooks/useMinimumLoader";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

function Planner() {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState("");
  const [loading, setLoading] = useState(true);
  const loaderDelayDone = useMinimumLoader(500);
  const [error, setError] = useState("");

  const [plannerForm, setPlannerForm] = useState({
    subject: "",
    deadline: "",
    difficulty: "3",
    estimatedHours: "2",
  });

  const [plannedItems, setPlannedItems] = useState(() => {
    const saved = localStorage.getItem("plannedItems");
    return saved ? JSON.parse(saved) : [];
  });

  const fetchTasks = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(`${API_BASE_URL}/tasks`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch tasks");
      }

      setTasks(data);
    } catch (err) {
      setError(err.message || "Failed to fetch tasks");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  useEffect(() => {
    localStorage.setItem("plannedItems", JSON.stringify(plannedItems));
  }, [plannedItems]);

  const handleAddTask = async () => {
    if (!newTask.trim()) return;

    try {
      const token = localStorage.getItem("token");
      setError("");

      const response = await fetch(`${API_BASE_URL}/tasks`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title: newTask.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to add task");
      }

      setNewTask("");
      fetchTasks();
    } catch (err) {
      setError(err.message || "Failed to add task");
    }
  };

  const handleDeleteTask = async (id) => {
    try {
      const token = localStorage.getItem("token");
      setError("");

      const response = await fetch(`${API_BASE_URL}/tasks/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete task");
      }

      fetchTasks();
    } catch (err) {
      setError(err.message || "Failed to delete task");
    }
  };

  const handlePlannerChange = (e) => {
    setPlannerForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const calculatePriorityScore = (item) => {
    const today = new Date();
    const deadlineDate = new Date(item.deadline);
    const diffTime = deadlineDate - today;
    const daysLeft = Math.max(
      1,
      Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    );

    const urgencyWeight = Math.max(1, 10 - daysLeft);
    const difficultyWeight = Number(item.difficulty) * 2;
    const estimatedHoursWeight = Number(item.estimatedHours);

    return urgencyWeight + difficultyWeight + estimatedHoursWeight;
  };

  const handleGeneratePlan = () => {
    const { subject, deadline, difficulty, estimatedHours } = plannerForm;

    if (!subject || !deadline || !difficulty || !estimatedHours) {
      setError("Please fill all planner fields before generating the plan.");
      return;
    }

    setError("");

    const newPlannedItem = {
      id: Date.now(),
      subject,
      deadline,
      difficulty,
      estimatedHours,
    };

    setPlannedItems((prev) => [...prev, newPlannedItem]);

    setPlannerForm({
      subject: "",
      deadline: "",
      difficulty: "3",
      estimatedHours: "2",
    });
  };

  const rankedPlan = useMemo(() => {
    return [...plannedItems]
      .map((item) => ({
        ...item,
        priorityScore: calculatePriorityScore(item),
      }))
      .sort((a, b) => b.priorityScore - a.priorityScore);
  }, [plannedItems]);

  if (loading || !loaderDelayDone) {
    return (
      <AppLayout
        title="Smart Planner"
        subtitle="Generate and manage your personalized study schedule"
      >
        <AppLoader message="Loading planner workspace..." />
      </AppLayout>
    );
  }

  return (
    <AppLayout
      title="Smart Planner"
      subtitle="Generate and manage your personalized study schedule"
    >
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="space-y-6">
          <div className="glass-card lux-hero rounded-[30px] p-7">
            <h3 className="text-3xl font-black section-title">
              Smart Planning Workspace
            </h3>
            <p className="section-subtitle mt-3 text-lg">
              Add quick tasks, generate priority-based plans, and organize your
              study flow beautifully.
            </p>
          </div>

          <div className="glass-card rounded-[28px] p-6">
            <h3 className="text-2xl font-black section-title">
              Quick Task Planner
            </h3>
            <p className="section-subtitle mt-2">
              Add and manage your study tasks securely.
            </p>

            <div className="flex gap-3 mt-6">
              <input
                type="text"
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                placeholder="Enter a study task"
                className="lux-input"
              />
              <button
                onClick={handleAddTask}
                className="rounded-2xl px-5 py-4 font-bold text-white bg-gradient-to-r from-amber-500 to-yellow-500"
              >
                Add
              </button>
            </div>

            {error && (
              <p className="text-red-500 text-sm font-medium mt-4">{error}</p>
            )}

            <div className="mt-6 space-y-3">
              {tasks.length === 0 ? (
                <p className="section-subtitle">No tasks added yet.</p>
              ) : (
                tasks.map((task) => (
                  <div
                    key={task._id}
                    className="metric-card rounded-[20px] px-4 py-4 flex items-center justify-between gap-3"
                  >
                    <span className="metric-value">{task.title}</span>
                    <button
                      onClick={() => handleDeleteTask(task._id)}
                      className="text-red-500 hover:text-red-700 font-semibold"
                    >
                      Delete
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="glass-card rounded-[28px] p-6">
            <h3 className="text-2xl font-black section-title">
              AI Smart Schedule Generator
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              <input
                type="text"
                name="subject"
                value={plannerForm.subject}
                onChange={handlePlannerChange}
                placeholder="Subject"
                className="lux-input"
              />
              <input
                type="date"
                name="deadline"
                value={plannerForm.deadline}
                onChange={handlePlannerChange}
                className="lux-input"
              />
              <select
                name="difficulty"
                value={plannerForm.difficulty}
                onChange={handlePlannerChange}
                className="lux-input"
              >
                <option value="1">1 - Very Easy</option>
                <option value="2">2 - Easy</option>
                <option value="3">3 - Medium</option>
                <option value="4">4 - Hard</option>
                <option value="5">5 - Very Hard</option>
              </select>
              <input
                type="number"
                min="1"
                max="20"
                name="estimatedHours"
                value={plannerForm.estimatedHours}
                onChange={handlePlannerChange}
                className="lux-input"
                placeholder="Estimated Hours"
              />
            </div>

            <button
              onClick={handleGeneratePlan}
              className="mt-6 rounded-2xl px-6 py-4 font-bold text-white bg-gradient-to-r from-amber-500 to-yellow-500"
            >
              Generate Smart Plan
            </button>
          </div>
        </div>

        <div className="space-y-6">
          <div className="glass-card rounded-[28px] p-6">
            <h3 className="text-2xl font-black section-title">
              Ranked Study Plan
            </h3>

            <div className="mt-6 space-y-4">
              {rankedPlan.length === 0 ? (
                <p className="section-subtitle">
                  No structured study plan generated yet.
                </p>
              ) : (
                rankedPlan.map((item, index) => (
                  <div key={item.id} className="metric-card rounded-[24px] p-5">
                    <p className="text-sm text-amber-700 dark:text-amber-300 font-semibold">
                      Priority #{index + 1}
                    </p>
                    <h4 className="text-xl font-black section-title mt-2">
                      {item.subject}
                    </h4>
                    <div className="mt-3 space-y-1 section-subtitle">
                      <p>Deadline: {item.deadline}</p>
                      <p>Difficulty: {item.difficulty}/5</p>
                      <p>Estimated Hours: {item.estimatedHours}</p>
                      <p className="font-bold text-amber-700 dark:text-amber-300">
                        Priority Score: {item.priorityScore}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="glass-card rounded-[28px] p-6">
            <h3 className="text-2xl font-black section-title">
              Algorithm Logic
            </h3>
            <div className="space-y-3 mt-4 text-sm section-subtitle">
              <p>• Urgency increases as deadline gets closer.</p>
              <p>• Higher difficulty adds more priority weight.</p>
              <p>• More estimated hours slightly increase scheduling priority.</p>
              <p>• Tasks are sorted using descending weighted priority score.</p>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

export default Planner;