import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { GoogleLogin } from "@react-oauth/google";
import AuthShell from "../../components/auth/AuthShell";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      navigate("/dashboard");
    }
  }, [navigate]);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "Unable to login");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      setError("");

      const response = await fetch(`${API_BASE_URL}/api/auth/google`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          credential: credentialResponse.credential,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Google login failed");
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "Google login failed");
    }
  };

  return (
    <AuthShell
      mode="login"
      title="Welcome Back"
      subtitle="Sign in to continue your premium focus workflow."
      sideTitle="Track. Focus. Evolve."
      sideText="A polished AI-powered study system for planning, analytics, attention monitoring, and adaptive productivity."
    >
      <motion.form
        onSubmit={handleLogin}
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.12 }}
        className="space-y-5"
      >
        <div>
          <label className="block text-sm label-text mb-2">Email</label>
          <input
            type="email"
            name="email"
            placeholder="you@example.com"
            value={formData.email}
            onChange={handleChange}
            className="lux-input"
            autoComplete="email"
          />
        </div>

        <div>
          <label className="block text-sm label-text mb-2">Password</label>
          <input
            type="password"
            name="password"
            placeholder="Enter password"
            value={formData.password}
            onChange={handleChange}
            className="lux-input"
            autoComplete="current-password"
          />
        </div>

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 text-red-600 px-4 py-3 dark:bg-red-900/20 dark:border-red-800 dark:text-red-300">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-2xl py-4 font-bold text-white shadow-lg bg-gradient-to-r from-amber-500 via-yellow-500 to-orange-500 hover:scale-[1.01] transition disabled:opacity-70"
        >
          {loading ? "Please wait..." : "Login"}
        </button>

        <div className="flex justify-center pt-2">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => setError("Google login failed")}
            theme="outline"
            text="continue_with"
            shape="pill"
          />
        </div>

        <p className="text-center auth-subtext pt-2 relative z-20">
          Don&apos;t have an account?{" "}
          <Link
            to="/signup"
            className="font-bold text-amber-700 dark:text-amber-300 hover:underline transition relative z-20"
          >
            Create one
          </Link>
        </p>
      </motion.form>
    </AuthShell>
  );
}

export default Login;