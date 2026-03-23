import React from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

function AppLayout({ title, subtitle, children }) {
  return (
    <div className="min-h-screen flex page-lux-bg text-slate-900 dark:text-white transition-colors duration-300">
      <Sidebar />
      <main className="flex-1 p-4 md:p-6 overflow-x-hidden">
        <Topbar title={title} subtitle={subtitle} />
        <div className="mt-6">{children}</div>
      </main>
    </div>
  );
}

export default AppLayout;