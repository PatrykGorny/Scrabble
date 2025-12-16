"use client";

import { useState } from "react";
import Sidebar from "./components/Sidebar";
import TopBar from "./components/TopBar";
import Footer from "./components/Footer";

export default function ClientLayout({ children }) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen">
      <Sidebar
        mobileOpen={mobileSidebarOpen}
        setMobileOpen={setMobileSidebarOpen}
      />

      <div className="flex flex-col flex-1">
        <TopBar setMobileOpen={setMobileSidebarOpen} />

        <main className="flex-1 p-2 md:p-6 bg-gray-900">{children}</main>

        <Footer />
      </div>
    </div>
  );
}
