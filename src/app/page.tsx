"use client";

import { useStore } from "@/store/useStore";
import Onboarding from "@/components/Onboarding";
import AvatarChat from "@/components/AvatarChat";
import Sidebar from "@/components/layout/Sidebar";
import { Toaster } from "react-hot-toast";
import DashboardPage from "./dashboard/page";
import GoalsPage from "./goals/page";
import MemoryExplorer from "@/components/memory/MemoryExplorer";

export default function Home() {
  const { isOnboarded, isDarkMode, currentView } = useStore();

  if (!isOnboarded) {
    return (
      <>
        <Onboarding />
        <Toaster position="top-center" />
      </>
    );
  }

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        background: "var(--bg)",
        color: "var(--text)",
      }}
    >
      <Sidebar />
      <main
        style={{
          flex: 1,
          minWidth: 0,
          display: "flex",
          flexDirection: "column",
          background: "var(--bg)",
          overflow: "hidden",
        }}
      >
        {currentView === "chat" && <AvatarChat />}
        {currentView === "dashboard" && <DashboardPage />}
        {currentView === "goals" && <GoalsPage />}
        {currentView === "memory" && <MemoryExplorer />}
      </main>
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: "var(--card-bg)",
            color: "var(--text)",
            border: "1px solid var(--border)",
            fontFamily: "var(--font-sans)",
            fontSize: 14,
            borderRadius: "var(--radius-sm)",
          },
        }}
      />
    </div>
  );
}
