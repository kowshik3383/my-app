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
  title: "AI Health Companion - Your Personal Wellness Assistant",
  description:
    "AI-powered health companion with voice conversation, multilingual support, and personalized guidance for your wellness journey",
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