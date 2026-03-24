const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

function getAuthHeaders() {
  const token = localStorage.getItem("token");

  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

export async function getStats() {
  const response = await fetch(`${API_BASE_URL}/api/stats`, {
    headers: getAuthHeaders(),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch stats");
  }

  return data;
}

export async function updateStats(statsData) {
  const response = await fetch(`${API_BASE_URL}/api/stats`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(statsData),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to update stats");
  }

  return data;
}

export async function resetStats() {
  const response = await fetch(`${API_BASE_URL}/api/stats/reset`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to reset stats");
  }

  return data;
}