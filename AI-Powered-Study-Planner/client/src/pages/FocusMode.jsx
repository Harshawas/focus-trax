import React, { useCallback, useEffect, useRef, useState } from "react";
import AppLayout from "../components/layout/AppLayout";
import ToastMessage from "../components/common/ToastMessage";
import { getStats, updateStats } from "../services/statsService";
import { logDailyAnalytics } from "../services/analyticsService";
import { FaceLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";

function FocusMode() {
  const savedFocus = Number(localStorage.getItem("focusDuration")) || 25;
  const savedBreak = Number(localStorage.getItem("breakDuration")) || 5;
  const webcamMonitoring = localStorage.getItem("webcamMonitoring") !== "false";
  const tabTracking = localStorage.getItem("tabTracking") !== "false";
  const idleTracking = localStorage.getItem("idleTracking") !== "false";
  const autoStartBreaks = localStorage.getItem("autoStartBreaks") === "true";
  const autoStartFocus = localStorage.getItem("autoStartFocus") === "true";
  const notifications = localStorage.getItem("notifications") === "true";

  const focusTime = savedFocus * 60;
  const breakTime = savedBreak * 60;

  const [timeLeft, setTimeLeft] = useState(focusTime);
  const [isRunning, setIsRunning] = useState(false);
  const [isFocusSession, setIsFocusSession] = useState(true);

  const [cameraStatus, setCameraStatus] = useState(
    webcamMonitoring ? "Starting camera..." : "Monitoring disabled"
  );
  const [attentionStatus, setAttentionStatus] = useState(
    webcamMonitoring ? "Monitoring..." : "Disabled"
  );
  const [warningMessage, setWarningMessage] = useState("No warnings");

  const [completedFocusSessions, setCompletedFocusSessions] = useState(0);
  const [distractedEvents, setDistractedEvents] = useState(0);
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [windowBlurCount, setWindowBlurCount] = useState(0);
  const [warningCount, setWarningCount] = useState(0);

  const [faceDetected, setFaceDetected] = useState(true);
  const [faceMissingSeconds, setFaceMissingSeconds] = useState(0);

  const [modelReady, setModelReady] = useState(false);
  const [videoReady, setVideoReady] = useState(false);

  const [toast, setToast] = useState({ type: "", message: "" });

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const faceLandmarkerRef = useRef(null);
  const animationFrameRef = useRef(null);
  const lastVideoTimeRef = useRef(-1);

  const distractedIncrementedRef = useRef(false);
  const warningOneLoggedRef = useRef(false);
  const warningTwoLoggedRef = useRef(false);

  const cardClass =
    "glass-card rounded-[28px] p-6 border border-slate-200 dark:border-slate-800 transition-colors duration-300";

  let currentWarningLevel = 0;
  let derivedCameraStatus = cameraStatus;
  let derivedAttentionStatus = attentionStatus;
  let derivedWarningMessage = warningMessage;

  if (webcamMonitoring && idleTracking) {
    if (faceMissingSeconds >= 15) {
      currentWarningLevel = 3;
      derivedCameraStatus = "Low Engagement";
      derivedAttentionStatus = "Distracted";
      derivedWarningMessage = "Session marked as low engagement.";
    } else if (faceMissingSeconds >= 10) {
      currentWarningLevel = 2;
      derivedCameraStatus = "User Missing";
      derivedAttentionStatus = "Distracted";
      derivedWarningMessage = "Warning 2: Please return to the screen.";
    } else if (faceMissingSeconds >= 5) {
      currentWarningLevel = 1;
      derivedCameraStatus = "Face Not Detected";
      derivedAttentionStatus = "Low";
      derivedWarningMessage = "Warning 1: Face not detected.";
    }
  }

  const focusScore = Math.max(
    0,
    100 - tabSwitchCount * 10 - windowBlurCount * 5 - warningCount * 15
  );

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => {
      setToast({ type: "", message: "" });
    }, 2500);
  };

  const showBrowserNotification = useCallback(
    (title, body) => {
      if (!notifications) return;

      if ("Notification" in window) {
        if (Notification.permission === "granted") {
          new Notification(title, { body });
        } else if (Notification.permission !== "denied") {
          Notification.requestPermission().then((permission) => {
            if (permission === "granted") {
              new Notification(title, { body });
            }
          });
        }
      }
    },
    [notifications]
  );

  const syncStatsToDatabase = useCallback(
    async (overrides = {}) => {
      try {
        await updateStats({
          completedFocusSessions,
          distractedEvents,
          tabSwitchCount,
          windowBlurCount,
          warningCount,
          ...overrides,
        });
      } catch (error) {
        console.error("Failed to sync stats:", error);
      }
    },
    [
      completedFocusSessions,
      distractedEvents,
      tabSwitchCount,
      windowBlurCount,
      warningCount,
    ]
  );

  useEffect(() => {
    const loadStats = async () => {
      try {
        const stats = await getStats();
        setCompletedFocusSessions(stats.completedFocusSessions || 0);
        setDistractedEvents(stats.distractedEvents || 0);
        setTabSwitchCount(stats.tabSwitchCount || 0);
        setWindowBlurCount(stats.windowBlurCount || 0);
        setWarningCount(stats.warningCount || 0);
      } catch (error) {
        console.error("Failed to load stats:", error);
      }
    };

    loadStats();
  }, []);

  useEffect(() => {
    if (!webcamMonitoring) return;

    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });

        streamRef.current = stream;

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadeddata = () => {
            setVideoReady(true);
          };
        }

        setCameraStatus("Camera Active");
        setAttentionStatus("Monitoring...");
        setWarningMessage("No warnings");
      } catch (error) {
        console.error("Camera access error:", error);
        setCameraStatus("No Camera Access");
        setAttentionStatus("Unavailable");
      }
    };

    startCamera();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, [webcamMonitoring]);

  useEffect(() => {
    const initializeFaceLandmarker = async () => {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.18/wasm"
        );

        const faceLandmarker = await FaceLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath:
              "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/latest/face_landmarker.task",
          },
          runningMode: "VIDEO",
          numFaces: 1,
        });

        faceLandmarkerRef.current = faceLandmarker;
        setModelReady(true);
      } catch (error) {
        console.error("Failed to initialize MediaPipe:", error);
      }
    };

    initializeFaceLandmarker();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!webcamMonitoring) return;
    if (!modelReady || !videoReady) return;

    const detectFace = () => {
      const video = videoRef.current;
      const faceLandmarker = faceLandmarkerRef.current;

      if (
        video &&
        faceLandmarker &&
        video.readyState >= 2 &&
        lastVideoTimeRef.current !== video.currentTime
      ) {
        lastVideoTimeRef.current = video.currentTime;

        try {
          const results = faceLandmarker.detectForVideo(
            video,
            performance.now()
          );

          const hasFace =
            results &&
            results.faceLandmarks &&
            results.faceLandmarks.length > 0;

          setFaceDetected(hasFace);

          if (hasFace) {
            distractedIncrementedRef.current = false;
            warningOneLoggedRef.current = false;
            warningTwoLoggedRef.current = false;
            setFaceMissingSeconds(0);
            setCameraStatus("Face Detected");
            setAttentionStatus("Good");
            setWarningMessage("No warnings");
          }
        } catch (error) {
          console.error("Face detection error:", error);
        }
      }

      animationFrameRef.current = requestAnimationFrame(detectFace);
    };

    animationFrameRef.current = requestAnimationFrame(detectFace);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [webcamMonitoring, modelReady, videoReady]);

  useEffect(() => {
    if (!webcamMonitoring || faceDetected) return;

    const interval = setInterval(() => {
      setFaceMissingSeconds((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [faceDetected, webcamMonitoring]);

  useEffect(() => {
    let timer;
    let completionTimer;

    if (isRunning && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      completionTimer = setTimeout(async () => {
        if (isFocusSession) {
          const newCompleted = completedFocusSessions + 1;
          setCompletedFocusSessions(newCompleted);
          await syncStatsToDatabase({ completedFocusSessions: newCompleted });

          await logDailyAnalytics({
            focusMinutes: savedFocus,
            completedSessions: 1,
          });

          showToast("success", "Focus session completed.");
          showBrowserNotification(
            "Focus Session Complete",
            "Time for a short break."
          );

          setIsFocusSession(false);
          setTimeLeft(breakTime);
          setIsRunning(autoStartBreaks);
        } else {
          showToast("info", "Break session completed.");
          showBrowserNotification(
            "Break Complete",
            "Your next focus session is ready."
          );

          setIsFocusSession(true);
          setTimeLeft(focusTime);
          setIsRunning(autoStartFocus);
        }
      }, 0);
    }

    return () => {
      if (timer) clearInterval(timer);
      if (completionTimer) clearTimeout(completionTimer);
    };
  }, [
    isRunning,
    timeLeft,
    isFocusSession,
    completedFocusSessions,
    syncStatsToDatabase,
    savedFocus,
    breakTime,
    focusTime,
    autoStartBreaks,
    autoStartFocus,
    showBrowserNotification,
  ]);

  useEffect(() => {
    if (!tabTracking) return;

    const handleVisibilityChange = async () => {
      if (document.hidden) {
        const newCount = tabSwitchCount + 1;
        setTabSwitchCount(newCount);
        await syncStatsToDatabase({ tabSwitchCount: newCount });
        await logDailyAnalytics({ tabSwitches: 1 });
      }
    };

    const handleWindowBlur = async () => {
      const newCount = windowBlurCount + 1;
      setWindowBlurCount(newCount);
      await syncStatsToDatabase({ windowBlurCount: newCount });
      await logDailyAnalytics({ windowBlurEvents: 1 });
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleWindowBlur);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleWindowBlur);
    };
  }, [tabTracking, tabSwitchCount, windowBlurCount, syncStatsToDatabase]);

  useEffect(() => {
    if (!webcamMonitoring || !idleTracking) return;

    let delayedUpdate;

    if (faceMissingSeconds === 5 && !warningOneLoggedRef.current) {
      warningOneLoggedRef.current = true;

      delayedUpdate = setTimeout(async () => {
        const newWarnings = warningCount + 1;
        setWarningCount(newWarnings);
        await syncStatsToDatabase({ warningCount: newWarnings });
        await logDailyAnalytics({ warnings: 1 });
      }, 0);
    }

    if (faceMissingSeconds === 10 && !warningTwoLoggedRef.current) {
      warningTwoLoggedRef.current = true;

      delayedUpdate = setTimeout(async () => {
        const newWarnings = warningCount + 1;
        setWarningCount(newWarnings);
        await syncStatsToDatabase({ warningCount: newWarnings });
        await logDailyAnalytics({ warnings: 1 });

        showBrowserNotification(
          "Focus Warning",
          "Your face is not detected. Please return to the study session."
        );
      }, 0);
    }

    if (faceMissingSeconds >= 15 && !distractedIncrementedRef.current) {
      distractedIncrementedRef.current = true;

      delayedUpdate = setTimeout(async () => {
        const newDistracted = distractedEvents + 1;
        setDistractedEvents(newDistracted);
        await syncStatsToDatabase({ distractedEvents: newDistracted });
        await logDailyAnalytics({ distractedEvents: 1 });
      }, 0);
    }

    return () => {
      if (delayedUpdate) clearTimeout(delayedUpdate);
    };
  }, [
    faceMissingSeconds,
    webcamMonitoring,
    idleTracking,
    warningCount,
    distractedEvents,
    syncStatsToDatabase,
    showBrowserNotification,
  ]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  const handlePauseResume = () => {
    setIsRunning((prev) => !prev);
  };

  const handleSkip = () => {
    if (isFocusSession) {
      setIsFocusSession(false);
      setTimeLeft(breakTime);
    } else {
      setIsFocusSession(true);
      setTimeLeft(focusTime);
    }
    setIsRunning(false);
  };

  const handleEndSession = () => {
    setIsRunning(false);
    setIsFocusSession(true);
    setTimeLeft(focusTime);
    setFaceMissingSeconds(0);
    distractedIncrementedRef.current = false;
    warningOneLoggedRef.current = false;
    warningTwoLoggedRef.current = false;
    setWarningMessage("No warnings");
    setAttentionStatus(webcamMonitoring ? "Monitoring..." : "Disabled");
    showToast("info", "Session ended and timer reset.");
  };

  return (
    <AppLayout
      title="Focus Mode"
      subtitle="Track live study engagement and focus sessions"
    >
      <div className="space-y-6">
        <ToastMessage type={toast.type} message={toast.message} />

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2 space-y-6">
            <div className={cardClass}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-stretch">
                <div className="md:col-span-2 rounded-2xl overflow-hidden bg-slate-200/60 dark:bg-slate-800 h-80 flex items-center justify-center border border-amber-200/20 dark:border-white/5">
                  {webcamMonitoring ? (
                    <video
                      ref={videoRef}
                      autoPlay
                      muted
                      playsInline
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <p className="section-subtitle">
                      Webcam monitoring disabled
                    </p>
                  )}
                </div>

                <div className="metric-card rounded-2xl p-5 flex flex-col justify-between">
                  <div>
                    <h3 className="text-xl font-black section-title mb-3">
                      Live Focus Monitor
                    </h3>
                    <p className="section-subtitle">{derivedCameraStatus}</p>
                  </div>

                  <div className="space-y-3 mt-5">
                    <div className="metric-card rounded-xl px-4 py-3">
                      <p className="metric-title">Attention</p>
                      <p
                        className={`font-bold text-lg mt-1 ${
                          derivedAttentionStatus === "Good"
                            ? "text-green-600"
                            : derivedAttentionStatus === "Low"
                            ? "text-yellow-600"
                            : "text-red-500"
                        }`}
                      >
                        {derivedAttentionStatus}
                      </p>
                    </div>

                    <div className="metric-card rounded-xl px-4 py-3">
                      <p className="metric-title">MediaPipe Model</p>
                      <p className="metric-value font-bold text-lg mt-1">
                        {modelReady ? "Ready" : "Loading"}
                      </p>
                    </div>

                    <div className="metric-card rounded-xl px-4 py-3">
                      <p className="metric-title">Video Feed</p>
                      <p className="metric-value font-bold text-lg mt-1">
                        {videoReady ? "Ready" : "Loading"}
                      </p>
                    </div>

                    <div className="metric-card rounded-xl px-4 py-3">
                      <p className="metric-title">Face Presence</p>
                      <p className="metric-value font-bold text-lg mt-1">
                        {faceDetected ? "Detected" : "Missing"}
                      </p>
                    </div>

                    <div className="warning-panel rounded-xl px-4 py-3">
                      <p className="font-semibold text-amber-800 dark:text-yellow-300">
                        {derivedWarningMessage}
                      </p>
                    </div>

                    <div className="metric-card rounded-xl px-4 py-3">
                      <p className="metric-title">Face Missing Time</p>
                      <p className="metric-value font-bold text-lg mt-1">
                        {faceMissingSeconds}s
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="glass-card lux-hero rounded-[30px] p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-2xl font-black section-title">
                  Pomodoro Focus Timer
                </h3>
                <span className="text-sm px-3 py-1 rounded-full bg-white/55 dark:bg-white/10 border border-amber-200/30 dark:border-white/10 section-subtitle">
                  {isFocusSession ? "Focus Session" : "Break Session"}
                </span>
              </div>

              <div className="text-center py-6">
                <p className="text-6xl font-black tracking-wide section-title">
                  {formatTime(timeLeft)}
                </p>
                <p className="mt-3 section-subtitle text-lg">
                  {isFocusSession ? "Time to Focus!" : "Take a Short Break!"}
                </p>
                <p className="mt-2 text-sm section-subtitle">
                  Using settings: {savedFocus} min focus / {savedBreak} min
                  break
                </p>
              </div>

              <div className="flex flex-wrap gap-3 justify-center mt-4">
                <button
                  onClick={handlePauseResume}
                  className="bg-white/70 dark:bg-white/10 hover:bg-white/90 dark:hover:bg-white/15 px-5 py-2 rounded-xl font-semibold transition section-title"
                >
                  {isRunning ? "Pause" : "Start"}
                </button>
                <button
                  onClick={handleSkip}
                  className="bg-white/70 dark:bg-white/10 hover:bg-white/90 dark:hover:bg-white/15 px-5 py-2 rounded-xl font-semibold transition section-title"
                >
                  Skip
                </button>
                <button
                  onClick={handleEndSession}
                  className="bg-amber-500 hover:bg-amber-600 text-white px-5 py-2 rounded-xl font-semibold transition"
                >
                  End Session
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className={cardClass}>
              <h3 className="text-2xl font-black section-title mb-4">
                Focus Metrics
              </h3>

              <div className="space-y-4">
                <div className="metric-card rounded-xl p-4">
                  <p className="metric-title text-sm">Focus Score</p>
                  <p className="text-3xl font-bold text-blue-600 mt-1">
                    {focusScore}%
                  </p>
                </div>

                <div className="metric-card rounded-xl p-4">
                  <p className="metric-title text-sm">Completed Focus Sessions</p>
                  <p className="text-3xl font-bold text-green-600 mt-1">
                    {completedFocusSessions}
                  </p>
                </div>

                <div className="metric-card rounded-xl p-4">
                  <p className="metric-title text-sm">Distracted Events</p>
                  <p className="text-3xl font-bold text-orange-500 mt-1">
                    {distractedEvents}
                  </p>
                </div>

                <div className="metric-card rounded-xl p-4">
                  <p className="metric-title text-sm">Tab Switches</p>
                  <p className="text-3xl font-bold metric-value mt-1">
                    {tabSwitchCount}
                  </p>
                </div>

                <div className="metric-card rounded-xl p-4">
                  <p className="metric-title text-sm">Window Blur Events</p>
                  <p className="text-3xl font-bold metric-value mt-1">
                    {windowBlurCount}
                  </p>
                </div>

                <div className="metric-card rounded-xl p-4">
                  <p className="metric-title text-sm">Warnings</p>
                  <p className="text-3xl font-bold text-red-500 mt-1">
                    {warningCount}
                  </p>
                </div>
              </div>
            </div>

            <div className={cardClass}>
              <h3 className="text-2xl font-black section-title mb-4">
                Active Settings
              </h3>

              <div className="space-y-3 text-sm section-subtitle">
                <p>• Webcam monitoring: {webcamMonitoring ? "On" : "Off"}</p>
                <p>• Tab tracking: {tabTracking ? "On" : "Off"}</p>
                <p>• Idle tracking: {idleTracking ? "On" : "Off"}</p>
                <p>• Notifications: {notifications ? "On" : "Off"}</p>
                <p>• Auto-start breaks: {autoStartBreaks ? "On" : "Off"}</p>
                <p>• Auto-start focus: {autoStartFocus ? "On" : "Off"}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

export default FocusMode;