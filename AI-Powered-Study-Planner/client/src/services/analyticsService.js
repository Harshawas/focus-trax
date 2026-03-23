const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

function getAuthHeaders() {
  const token = localStorage.getItem("token");

  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

export async function logDailyAnalytics(increments) {
  const response = await fetch(`${API_BASE_URL}/api/analytics/log`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(increments),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to log daily analytics");
  }

  return data;
}

export async function getWeeklyAnalytics() {
  const response = await fetch(`${API_BASE_URL}/api/analytics/weekly`, {
    headers: getAuthHeaders(),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch weekly analytics");
  }

  return data;
}

export async function resetDailyAnalytics() {
  const response = await fetch(`${API_BASE_URL}/api/analytics/reset`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to reset daily analytics");
  }

  return data;
}