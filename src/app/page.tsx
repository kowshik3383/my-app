"use client";

import Navbar from "@/components/landing/Navbar";
import HeroSection from "@/components/landing/HeroSection";
import ComparisonSection from "@/components/landing/ComparisonSection";
import MemorySection from "@/components/landing/MemorySection";
import DashboardSection from "@/components/landing/DashboardSection";
import GoalTrackingSection from "@/components/landing/GoalTrackingSection";
import VoiceSection from "@/components/landing/VoiceSection";
import ArchitectureSection from "@/components/landing/ArchitectureSection";
import FeaturesGrid from "@/components/landing/FeaturesGrid";
import TestimonialsSection from "@/components/landing/TestimonialsSection";
import SecuritySection from "@/components/landing/SecuritySection";
import FinalCTA from "@/components/landing/FinalCTA";
import Footer from "@/components/landing/Footer";

export default function LandingPage() {
  return (
    <div className="font-sans antialiased">
      <Navbar />
      <HeroSection />
      <ComparisonSection />
      <MemorySection />
      <DashboardSection />
      <GoalTrackingSection />
      <VoiceSection />
      <ArchitectureSection />
      <FeaturesGrid />
      <TestimonialsSection />
      <SecuritySection />
      <FinalCTA />
      <Footer />
    </div>
  );
}
