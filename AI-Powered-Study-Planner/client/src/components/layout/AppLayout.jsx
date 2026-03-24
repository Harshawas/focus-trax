import React from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

function AppLayout({ title, subtitle, children }) {
  return (
    <div className="min-h-screen page-lux-bg flex overflow-visible">
      <Sidebar />

      <main className="flex-1 p-4 md:p-5 overflow-visible relative z-0">
        <div className="space-y-6 overflow-visible">
          <Topbar title={title} subtitle={subtitle} />

          <div className="relative z-0 overflow-visible">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}

export default AppLayout;