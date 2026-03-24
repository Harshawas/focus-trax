const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

function getAuthHeaders() {
  const token = localStorage.getItem("token");

  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

export async function getProfile() {
  const response = await fetch(`${API_BASE_URL}/api/profile`, {
    headers: getAuthHeaders(),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch profile");
  }

  return data;
}

export async function updateProfile(profileData) {
  const response = await fetch(`${API_BASE_URL}/api/profile`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(profileData),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to update profile");
  }

  return data;
}

export async function uploadAvatar(file) {
  const token = localStorage.getItem("token");
  const formData = new FormData();
  formData.append("avatar", file);

  const response = await fetch(`${API_BASE_URL}/api/profile/avatar`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to upload avatar");
  }

  return data;
}

export async function removeAvatar() {
  const response = await fetch(`${API_BASE_URL}/api/profile`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify({
      avatarUrl: "",
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to remove avatar");
  }

  return data;
}