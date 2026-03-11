"use client";

import { useEffect } from "react";
import { useStore } from "@/store/useStore";
import Onboarding from "@/components/Onboarding";
import AvatarChat from "@/components/AvatarChat";
import Header from "@/components/Header";
import { Toaster } from "react-hot-toast";

export default function Home() {
  const { isOnboarded, isDarkMode } = useStore();

  // Sync dark mode to <html> so browser chrome stays consistent
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
      document.documentElement.style.colorScheme = "dark";
    } else {
      document.documentElement.classList.remove("dark");
      document.documentElement.style.colorScheme = "light";
    }
  }, [isDarkMode]);

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
        flexDirection: "column",
        background: isDarkMode ? "#0a0a0c" : "#f9f7f4",
        transition: "background 0.25s ease",
      }}
    >
      <Header />
      <main style={{ flex: 1, overflow: "hidden" }}>
        <AvatarChat />
      </main>
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: isDarkMode ? "#1e1e22" : "#fff",
            color: isDarkMode ? "#f0f0f0" : "#1a1a1a",
            border: `1px solid ${isDarkMode ? "#333" : "#eeebe7"}`,
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 14,
          },
        }}
      />
    </div>
  );
}
