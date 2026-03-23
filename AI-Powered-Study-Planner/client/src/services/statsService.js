const API_URL = "http://localhost:5000/api/stats";

export const getStats = async () => {
  const token = localStorage.getItem("token");

  const response = await fetch(API_URL, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch stats");
  }

  return data;
};

export const updateStats = async (statsPayload) => {
  const token = localStorage.getItem("token");

  const response = await fetch(API_URL, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(statsPayload),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to update stats");
  }

  return data;
};

export const resetStats = async () => {
  const token = localStorage.getItem("token");

  const response = await fetch(`${API_URL}/reset`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to reset stats");
  }

  return data;
};