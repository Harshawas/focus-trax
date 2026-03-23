import React from "react";

function ToastMessage({ type = "success", message }) {
  if (!message) return null;

  const styleMap = {
    success:
      "bg-green-50 border-green-200 text-green-700 dark:bg-green-900/20 dark:border-green-800 dark:text-green-300",
    error:
      "bg-red-50 border-red-200 text-red-700 dark:bg-red-900/20 dark:border-red-800 dark:text-red-300",
    info:
      "bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-300",
  };

  return (
    <div className={`border rounded-xl px-4 py-3 font-medium ${styleMap[type]}`}>
      {message}
    </div>
  );
}

export default ToastMessage;