"use client";

import { useStore } from "@/store/useStore";
import Onboarding from "@/components/Onboarding";
import AvatarChat from "@/components/AvatarChat";
import Header from "@/components/Header";
import { Toaster } from "react-hot-toast";
import DashboardPage from "./dashboard/page";

export default function Home() {
  const { isOnboarded, showDashboard } = useStore();

  if (!isOnboarded) {
    return (
      <>
        <Onboarding />
        <Toaster position="top-center" />
      </>
    );
  }

  if (showDashboard) {
    return <DashboardPage />;
  }

  return (
    <div className="h-screen flex flex-col">
      <Header />
      <main className="flex-1 overflow-hidden">
        <AvatarChat />
      </main>
      <Toaster position="top-center" />
    </div>
  );
}
