"use client";

import { useStore } from "@/store/useStore";
import Onboarding from "@/components/Onboarding";
import Chat from "@/components/Chat";
import Header from "@/components/Header";
import { Toaster } from "react-hot-toast";

export default function Home() {
  const { isOnboarded } = useStore();

  if (!isOnboarded) {
    return (
      <>
        <Onboarding />
        <Toaster position="top-center" />
      </>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      <Header />
      <main className="flex-1 overflow-hidden">
        <Chat />
      </main>
      <Toaster position="top-center" />
    </div>
  );
}
