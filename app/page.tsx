import { CountersSection } from "@/components/counters";
import { EventInfoSection } from "@/components/event-info";
import { FinalCtaSection } from "@/components/final-cta";
import { HeroSection } from "@/components/hero";
import { OfficialTrainingsSection } from "@/components/official-trainings";
import { SocialFeedSection } from "@/components/social-feed";
import { TrophiesSection } from "@/components/trophies";

export default function HomePage() {
  return (
    <main>
      <HeroSection />
      <EventInfoSection />
      <CountersSection />
      <TrophiesSection />
      <SocialFeedSection />
      <OfficialTrainingsSection />
      <FinalCtaSection />
    </main>
  );
}