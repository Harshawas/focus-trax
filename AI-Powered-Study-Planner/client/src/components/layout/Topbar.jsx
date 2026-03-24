import React, { useEffect, useRef, useState } from "react";
import { Bell, UserCircle2, CheckCheck, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import FocusFlowLogo from "../branding/FocusFlowLogo";
import {
  clearNotifications,
  formatNotificationTime,
  getNotifications,
  getUnreadNotificationCount,
  markAllNotificationsRead,
  NOTIFICATION_EVENT_NAME,
} from "../../services/notificationService";

function Topbar({ title, subtitle }) {
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  const user = JSON.parse(localStorage.getItem("user")) || {};
  const avatar = user.avatarUrl;

  const [showNotifications, setShowNotifications] = useState(false);

  const [notificationStatus, setNotificationStatus] = useState(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      return Notification.permission;
    }
    return "default";
  });

  const [notifications, setNotifications] = useState(() => getNotifications());
  const [unreadCount, setUnreadCount] = useState(() =>
    getUnreadNotificationCount()
  );

  const refreshNotifications = () => {
    const items = getNotifications();
    setNotifications(items);
    setUnreadCount(getUnreadNotificationCount());
  };

  useEffect(() => {
    const handler = () => {
      refreshNotifications();

      if ("Notification" in window) {
        setNotificationStatus(Notification.permission);
      }
    };

    window.addEventListener(NOTIFICATION_EVENT_NAME, handler);
    window.addEventListener("focus", handler);

    return () => {
      window.removeEventListener(NOTIFICATION_EVENT_NAME, handler);
      window.removeEventListener("focus", handler);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const enableNotifications = async () => {
    if (!("Notification" in window)) return;

    const permission = await Notification.requestPermission();
    setNotificationStatus(permission);

    if (permission === "granted") {
      localStorage.setItem("notifications", "true");
      new Notification("Focus Trax Notifications Enabled", {
        body: "You will now receive study alerts and reminders.",
      });
    }
  };

  const handleMarkAllRead = () => {
    markAllNotificationsRead();
    refreshNotifications();
  };

  const handleClearAll = () => {
    clearNotifications();
    refreshNotifications();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card rounded-[28px] px-6 py-5 flex items-center justify-between relative z-[120] overflow-visible"
    >
      <div>
        <h2 className="text-3xl font-black gold-text">{title}</h2>
        {subtitle && <p className="section-subtitle mt-1">{subtitle}</p>}
      </div>

      <div
        className="flex items-center gap-3 relative z-[130] overflow-visible"
        ref={dropdownRef}
      >
        <div className="hidden lg:block opacity-90">
          <FocusFlowLogo size={44} showText={false} iconOnly />
        </div>

        <button
          onClick={() => setShowNotifications((prev) => !prev)}
          className="relative h-11 w-11 rounded-2xl bg-white/70 dark:bg-white/5 border border-amber-200/50 dark:border-white/10 flex items-center justify-center"
        >
          <Bell className="w-5 h-5 text-amber-600 dark:text-amber-300" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>

        <button
          onClick={() => navigate("/profile")}
          className="h-11 w-11 rounded-2xl bg-white/70 dark:bg-white/5 border border-amber-200/50 dark:border-white/10 flex items-center justify-center overflow-hidden"
        >
          {avatar ? (
            <img
              src={avatar}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          ) : (
            <UserCircle2 className="w-5 h-5 text-slate-700 dark:text-slate-200" />
          )}
        </button>

        {showNotifications && (
          <div className="absolute right-0 top-16 w-[360px] max-h-[520px] glass-card rounded-2xl p-4 shadow-2xl z-[999] border border-amber-200/40 dark:border-white/10 overflow-hidden">
            <div className="flex items-center justify-between gap-3">
              <h4 className="text-lg font-black section-title">Notifications</h4>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleMarkAllRead}
                  className="h-9 w-9 rounded-xl bg-white/70 dark:bg-white/5 border border-amber-200/40 dark:border-white/10 flex items-center justify-center"
                  title="Mark all read"
                >
                  <CheckCheck className="w-4 h-4 text-slate-700 dark:text-slate-200" />
                </button>

                <button
                  onClick={handleClearAll}
                  className="h-9 w-9 rounded-xl bg-white/70 dark:bg-white/5 border border-amber-200/40 dark:border-white/10 flex items-center justify-center"
                  title="Clear all"
                >
                  <Trash2 className="w-4 h-4 text-red-500" />
                </button>
              </div>
            </div>

            <div className="mt-3 metric-card rounded-xl p-4">
              <p className="metric-title text-sm">Browser Permission</p>
              <p className="metric-value font-semibold mt-1 capitalize">
                {notificationStatus}
              </p>

              <button
                onClick={enableNotifications}
                className="mt-3 w-full rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 text-white font-semibold py-2.5"
              >
                Enable Browser Notifications
              </button>
            </div>

            <div className="mt-4 max-h-[320px] overflow-y-auto space-y-3 pr-1">
              {notifications.length === 0 ? (
                <div className="metric-card rounded-xl p-4">
                  <p className="metric-value font-semibold">No notifications yet</p>
                  <p className="section-subtitle text-sm mt-1">
                    Session alerts, warnings, and account updates will appear here.
                  </p>
                </div>
              ) : (
                notifications.map((item) => (
                  <div
                    key={item.id}
                    className={`metric-card rounded-xl p-4 border ${
                      !item.read
                        ? "border-amber-300/50 dark:border-amber-400/30"
                        : "border-transparent"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="metric-value font-semibold">{item.title}</p>
                        <p className="section-subtitle text-sm mt-1">
                          {item.message}
                        </p>
                        <p className="text-xs section-subtitle mt-2 opacity-80">
                          {formatNotificationTime(item.createdAt)}
                        </p>
                      </div>

                      {!item.read && (
                        <span className="mt-1 w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0" />
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default Topbar;