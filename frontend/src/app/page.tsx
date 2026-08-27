import {
  HomeHero,
  FeaturesGrid,
  CoreModules,
  HowItWorks,
  CreatorSection,
  HomeCta,
  HomeFooter,
} from "@/components/home";

export default function Home() {
  return (
    <div className="flex flex-col">
      {/* 1. Hero & Top Metrics Section */}
      <HomeHero />

      {/* 2. End-to-End Capabilities Grid */}
      <FeaturesGrid />

      {/* 3. Core Integrated Modules (Question Bank, Analytics, Editor) */}
      <CoreModules />

      {/* 4. Simple 4-Step Workflow */}
      <HowItWorks />

      {/* 5. Creator Profile & Links */}
      <CreatorSection />

      {/* 6. High-Impact CTA Section */}
      <HomeCta />

      {/* 7. Footer */}
      <HomeFooter />
    </div>
  );
}
