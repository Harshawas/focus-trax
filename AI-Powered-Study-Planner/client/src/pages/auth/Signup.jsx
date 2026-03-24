import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { GoogleLogin } from "@react-oauth/google";
import AuthShell from "../../components/auth/AuthShell";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

function Signup() {
  const navigate = useNavigate();
  const [step, setStep] = useState("signup");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      navigate("/dashboard");
    }
  }, [navigate]);

  const validatePassword = (password) => {
    return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^()_+\-=\[\]{};':"\\|,.<>\/~`]).{8,}$/.test(
      password
    );
  };

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    if (!validatePassword(formData.password)) {
      setLoading(false);
      setError(
        "Password must be at least 8 characters and include uppercase, lowercase, number, and symbol."
      );
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/signup-initiate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to send OTP");
      }

      setMessage("OTP sent to your email. Please verify.");
      setStep("verify");
    } catch (err) {
      setError(err.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/signup-verify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          otp,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "OTP verification failed");
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "OTP verification failed");
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
        throw new Error(data.message || "Google signup failed");
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "Google signup failed");
    }
  };

  return (
    <AuthShell
      mode="signup"
      title={step === "signup" ? "Create Account" : "Verify OTP"}
      subtitle={
        step === "signup"
          ? "Build your intelligent study space in seconds."
          : "Enter the OTP sent to your email to verify your account."
      }
      sideTitle="Build. Plan. Win."
      sideText="Beautiful analytics, smart planning, AI suggestions, and advanced focus tracking — wrapped inside a premium modern interface."
    >
      {step === "signup" ? (
        <motion.form
          onSubmit={handleSendOtp}
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.12 }}
          className="space-y-5"
        >
          <div>
            <label className="block text-sm label-text mb-2">Full Name</label>
            <input
              type="text"
              name="name"
              placeholder="Harsh Awasthi"
              value={formData.name}
              onChange={handleChange}
              className="lux-input"
              autoComplete="name"
            />
          </div>

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
              placeholder="Create password"
              value={formData.password}
              onChange={handleChange}
              className="lux-input"
              autoComplete="new-password"
            />
            <p className="text-xs auth-subtext mt-2">
              Must contain 8+ characters, uppercase, lowercase, number, and
              symbol.
            </p>
          </div>

          {error && (
            <div className="rounded-2xl border border-red-200 bg-red-50 text-red-600 px-4 py-3 dark:bg-red-900/20 dark:border-red-800 dark:text-red-300">
              {error}
            </div>
          )}

          {message && (
            <div className="rounded-2xl border border-green-200 bg-green-50 text-green-700 px-4 py-3 dark:bg-green-900/20 dark:border-green-800 dark:text-green-300">
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl py-4 font-bold text-white shadow-lg bg-gradient-to-r from-amber-500 via-yellow-500 to-orange-500 hover:scale-[1.01] transition disabled:opacity-70"
          >
            {loading ? "Sending OTP..." : "Create Account"}
          </button>

          <div className="flex justify-center pt-2">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => setError("Google signup failed")}
              theme="outline"
              text="continue_with"
              shape="pill"
            />
          </div>

          <p className="text-center auth-subtext pt-2 relative z-20">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-bold text-amber-700 dark:text-amber-300 hover:underline transition relative z-20"
            >
              Login
            </Link>
          </p>
        </motion.form>
      ) : (
        <motion.form
          onSubmit={handleVerifyOtp}
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.12 }}
          className="space-y-5"
        >
          <div>
            <label className="block text-sm label-text mb-2">OTP</label>
            <input
              type="text"
              placeholder="Enter 6-digit OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="lux-input"
            />
          </div>

          {error && (
            <div className="rounded-2xl border border-red-200 bg-red-50 text-red-600 px-4 py-3 dark:bg-red-900/20 dark:border-red-800 dark:text-red-300">
              {error}
            </div>
          )}

          {message && (
            <div className="rounded-2xl border border-green-200 bg-green-50 text-green-700 px-4 py-3 dark:bg-green-900/20 dark:border-green-800 dark:text-green-300">
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl py-4 font-bold text-white shadow-lg bg-gradient-to-r from-amber-500 via-yellow-500 to-orange-500 hover:scale-[1.01] transition disabled:opacity-70"
          >
            {loading ? "Verifying..." : "Verify OTP"}
          </button>

          <button
            type="button"
            onClick={() => {
              setStep("signup");
              setOtp("");
              setError("");
              setMessage("");
            }}
            className="w-full rounded-2xl py-4 font-bold border border-amber-300 text-amber-700 dark:text-amber-300"
          >
            Back
          </button>
        </motion.form>
      )}
    </AuthShell>
  );
}

export default Signup;