import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AI Health Companion V2 — Your Personal Health Operating System",
  description:
    "Track your health, emotions, goals, sleep, habits, and progress with an AI companion that actually remembers you. Persistent memory, emotional intelligence, voice conversations, and proactive coaching.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className="!bg-transparent"
      style={{ background: "transparent !important" }}
    >
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased !bg-transparent`}
        style={{ background: "transparent !important" }}
      >
        {children}
      </body>
    </html>
  );
}