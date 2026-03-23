import React from "react";

function EmptyState({ title, description }) {
  return (
    <div className="border border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-8 text-center bg-slate-50 dark:bg-slate-800">
      <h3 className="text-xl font-bold text-slate-800 dark:text-white">
        {title}
      </h3>
      <p className="text-slate-600 dark:text-slate-300 mt-2">
        {description}
      </p>
    </div>
  );
}

export default EmptyState;