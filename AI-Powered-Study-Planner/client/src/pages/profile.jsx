import React, { useEffect, useMemo, useState } from "react";
import AppLayout from "../components/layout/AppLayout";
import AppLoader from "../components/layout/AppLoader";
import useMinimumLoader from "../hooks/useMinimumLoader";
import {
  getProfile,
  removeAvatar,
  updateProfile,
  uploadAvatar,
} from "../services/profileService";
import { addNotification } from "../services/notificationService";

function Profile() {
  const loaderDelayDone = useMinimumLoader(500);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [removingAvatar, setRemovingAvatar] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [avatarError, setAvatarError] = useState(false);

  const [profile, setProfile] = useState({
    name: "",
    username: "",
    email: "",
    avatarUrl: "",
    age: "",
    linkedinUrl: "",
    bio: "",
    authProvider: "",
  });

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const data = await getProfile();
        setProfile({
          name: data.name || "",
          username: data.username || "",
          email: data.email || "",
          avatarUrl: data.avatarUrl || "",
          age: data.age || "",
          linkedinUrl: data.linkedinUrl || "",
          bio: data.bio || "",
          authProvider: data.authProvider || "",
        });
      } catch (err) {
        setError(err.message || "Failed to load profile.");
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  const handleChange = (e) => {
    setProfile((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const syncLocalUser = (updates) => {
    const existing = JSON.parse(localStorage.getItem("user")) || {};
    localStorage.setItem("user", JSON.stringify({ ...existing, ...updates }));
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      setError("");
      setMessage("");
      setAvatarError(false);

      const data = await uploadAvatar(file);

      setProfile((prev) => ({
        ...prev,
        avatarUrl: data.avatarUrl,
      }));

      syncLocalUser({ avatarUrl: data.avatarUrl });
      setMessage("Profile picture uploaded successfully.");

      addNotification({
        title: "Profile Picture Updated",
        message: "Your new profile picture has been uploaded successfully.",
        type: "success",
      });
    } catch (err) {
      console.error("Avatar upload failed:", err);
      setError(err.message || "Failed to upload profile picture.");
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveAvatar = async () => {
    try {
      setRemovingAvatar(true);
      setError("");
      setMessage("");
      setAvatarError(false);

      await removeAvatar();

      setProfile((prev) => ({
        ...prev,
        avatarUrl: "",
      }));

      syncLocalUser({ avatarUrl: "" });
      setMessage("Profile picture removed successfully.");

      addNotification({
        title: "Profile Picture Removed",
        message: "Your profile picture has been removed.",
        type: "warning",
      });
    } catch (err) {
      console.error("Avatar remove failed:", err);
      setError(err.message || "Failed to remove profile picture.");
    } finally {
      setRemovingAvatar(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError("");
      setMessage("");

      const data = await updateProfile({
        name: profile.name,
        username: profile.username,
        age: profile.age,
        linkedinUrl: profile.linkedinUrl,
        bio: profile.bio,
      });

      setProfile((prev) => ({
        ...prev,
        name: data.user.name,
        username: data.user.username || "",
        age: data.user.age || "",
        linkedinUrl: data.user.linkedinUrl || "",
        bio: data.user.bio || "",
        avatarUrl: data.user.avatarUrl || prev.avatarUrl,
      }));

      syncLocalUser({
        name: data.user.name,
        username: data.user.username,
        avatarUrl: data.user.avatarUrl || profile.avatarUrl,
      });

      setMessage("Profile updated successfully.");

      addNotification({
        title: "Profile Updated",
        message: "Your profile information has been saved successfully.",
        type: "success",
      });
    } catch (err) {
      console.error("Profile save failed:", err);
      setError(err.message || "Failed to save profile.");
    } finally {
      setSaving(false);
    }
  };

  const completionCount = useMemo(() => {
    return [
      profile.name,
      profile.username,
      profile.avatarUrl,
      profile.linkedinUrl,
      profile.bio,
      profile.age,
    ].filter(Boolean).length;
  }, [profile]);

  const completionPercent = Math.round((completionCount / 6) * 100);

  const cardClass =
    "glass-card rounded-[28px] p-6 border border-slate-200 dark:border-slate-800 transition-colors duration-300";
  const inputClass = "lux-input";

  if (loading || !loaderDelayDone) {
    return (
      <AppLayout
        title="Profile"
        subtitle="Manage your personal account details and public identity"
      >
        <AppLoader message="Loading profile..." />
      </AppLayout>
    );
  }

  const showAvatar = profile.avatarUrl && !avatarError;

  return (
    <AppLayout
      title="Profile"
      subtitle="Manage your personal account details and public identity"
    >
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          <div className="glass-card lux-hero rounded-[32px] p-8">
            <div className="flex flex-col md:flex-row md:items-center gap-6">
              {showAvatar ? (
                <img
                  src={profile.avatarUrl}
                  alt="Profile"
                  onError={() => setAvatarError(true)}
                  className="w-24 h-24 rounded-full object-cover border-4 border-white/60 dark:border-white/10 shadow-xl"
                />
              ) : (
                <div className="w-24 h-24 rounded-full flex items-center justify-center bg-white/70 dark:bg-slate-900 text-4xl font-black gold-text shadow-xl">
                  {(profile.name || "U").charAt(0)}
                </div>
              )}

              <div className="flex-1">
                <h3 className="text-4xl font-black section-title">
                  {profile.name || "Your Profile"}
                </h3>
                <p className="section-subtitle mt-2 text-lg">
                  @{profile.username || "username"} • {profile.email}
                </p>

                <div className="mt-5">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="label-text">Profile Completion</span>
                    <span className="font-semibold section-title">
                      {completionPercent}%
                    </span>
                  </div>

                  <div className="h-3 rounded-full bg-white/55 dark:bg-white/10 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-amber-500 to-yellow-500"
                      style={{ width: `${completionPercent}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className={cardClass}>
            <h3 className="text-2xl font-black section-title">Profile Picture</h3>

            <div className="mt-6 flex flex-col md:flex-row items-start gap-6">
              {showAvatar ? (
                <img
                  src={profile.avatarUrl}
                  alt="Profile"
                  onError={() => setAvatarError(true)}
                  className="w-28 h-28 rounded-full object-cover border border-amber-200 dark:border-slate-700"
                />
              ) : (
                <div className="w-28 h-28 rounded-full flex items-center justify-center bg-amber-100 dark:bg-slate-800 text-4xl font-black gold-text">
                  {(profile.name || "U").charAt(0)}
                </div>
              )}

              <div className="space-y-3">
                <label className="inline-block">
                  <span className="bg-gradient-to-r from-amber-500 to-yellow-500 text-white px-5 py-3 rounded-xl font-semibold cursor-pointer inline-block">
                    {uploading ? "Uploading..." : "Upload New Photo"}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarUpload}
                  />
                </label>

                {profile.avatarUrl && (
                  <button
                    type="button"
                    onClick={handleRemoveAvatar}
                    disabled={removingAvatar}
                    className="block bg-red-500 hover:bg-red-600 text-white px-5 py-3 rounded-xl font-semibold transition disabled:opacity-70"
                  >
                    {removingAvatar ? "Removing..." : "Remove Photo"}
                  </button>
                )}

                <p className="text-sm section-subtitle">
                  Upload JPG, PNG, or WEBP image up to 5MB.
                </p>
              </div>
            </div>
          </div>

          <div className={cardClass}>
            <h3 className="text-2xl font-black section-title">Basic Information</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              <div>
                <label className="block text-sm label-text mb-2">Full Name</label>
                <input
                  name="name"
                  value={profile.name}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="Enter full name"
                />
              </div>

              <div>
                <label className="block text-sm label-text mb-2">Username</label>
                <input
                  name="username"
                  value={profile.username}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="unique username"
                />
              </div>

              <div>
                <label className="block text-sm label-text mb-2">Email</label>
                <input
                  value={profile.email}
                  disabled
                  className={`${inputClass} opacity-70 cursor-not-allowed`}
                />
              </div>

              <div>
                <label className="block text-sm label-text mb-2">Age</label>
                <input
                  type="number"
                  name="age"
                  value={profile.age}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="Enter age"
                />
              </div>
            </div>
          </div>

          <div className={cardClass}>
            <h3 className="text-2xl font-black section-title">
              Professional & Personal Details
            </h3>

            <div className="grid grid-cols-1 gap-4 mt-6">
              <div>
                <label className="block text-sm label-text mb-2">
                  LinkedIn URL
                </label>
                <input
                  name="linkedinUrl"
                  value={profile.linkedinUrl}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="https://linkedin.com/in/..."
                />
              </div>

              <div>
                <label className="block text-sm label-text mb-2">Bio</label>
                <textarea
                  name="bio"
                  value={profile.bio}
                  onChange={handleChange}
                  rows="5"
                  className={inputClass}
                  placeholder="Write a short bio"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-gradient-to-r from-amber-500 to-yellow-500 text-white px-6 py-3 rounded-xl font-semibold transition disabled:opacity-70"
            >
              {saving ? "Saving..." : "Save Profile"}
            </button>

            {message && (
              <p className="text-green-600 dark:text-green-400 font-medium">
                {message}
              </p>
            )}

            {error && (
              <p className="text-red-500 dark:text-red-400 font-medium">
                {error}
              </p>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className={cardClass}>
            <h3 className="text-2xl font-black section-title mb-4">
              Profile Preview
            </h3>

            <div className="metric-card rounded-2xl p-6 text-center">
              {showAvatar ? (
                <img
                  src={profile.avatarUrl}
                  alt="Profile"
                  onError={() => setAvatarError(true)}
                  className="w-24 h-24 rounded-full object-cover mx-auto border border-amber-200 dark:border-slate-700"
                />
              ) : (
                <div className="w-24 h-24 rounded-full mx-auto flex items-center justify-center bg-amber-100 dark:bg-slate-800 text-3xl font-black gold-text">
                  {(profile.name || "U").charAt(0)}
                </div>
              )}

              <h4 className="text-xl font-black section-title mt-4">
                {profile.name || "User"}
              </h4>

              <p className="section-subtitle mt-1">
                @{profile.username || "username"}
              </p>

              <p className="section-subtitle mt-2">{profile.email}</p>

              {profile.age ? (
                <p className="metric-title mt-2">Age: {profile.age}</p>
              ) : null}

              {profile.linkedinUrl ? (
                <a
                  href={profile.linkedinUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="block mt-3 text-blue-600 dark:text-cyan-300 font-medium hover:underline"
                >
                  View LinkedIn
                </a>
              ) : null}

              {profile.bio ? (
                <p className="section-subtitle mt-4 text-sm leading-6">
                  {profile.bio}
                </p>
              ) : null}
            </div>
          </div>

          <div className={cardClass}>
            <h3 className="text-2xl font-black section-title mb-4">
              Account Details
            </h3>

            <div className="space-y-4">
              <InfoCard label="Auth Provider" value={profile.authProvider || "local"} />
              <InfoCard
                label="Username Status"
                value={profile.username ? "Configured" : "Not set yet"}
              />
              <InfoCard
                label="Profile Completion"
                value={`${completionCount}/6 fields completed`}
              />
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
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

export default Profile;