"use client";

import { useStore } from "@/store/useStore";
import Onboarding from "@/components/Onboarding";
import AvatarChat from "@/components/AvatarChat";
import Header from "@/components/Header";
import { Toaster } from "react-hot-toast";

export default function Home() {
  const { isOnboarded, userProfile } = useStore();
  const role = userProfile?.aiRole ?? "friend";

  if (!isOnboarded) {
    return (
      <>
        <Onboarding />
        <Toaster position="top-center" />
      </>
    );
  }

  return (
    // data-role drives all CSS variable cascades for role-based UI morphing
    <div className="h-screen flex flex-col" data-role={role}>
      <Header />
      <main className="flex-1 overflow-hidden">
        <AvatarChat />
      </main>
      <Toaster position="top-center" />
    </div>
  );
}
