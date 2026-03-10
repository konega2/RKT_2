import { CountersSection } from "@/components/counters";
import { EventInfoSection } from "@/components/event-info";
import { FinalCtaSection } from "@/components/final-cta";
import { HeroSection } from "@/components/hero";
import { OfficialTrainingsSection } from "@/components/official-trainings";
import { SocialFeedSection } from "@/components/social-feed";
import { TrophiesSection } from "@/components/trophies";
import { getLandingData } from "@/lib/landing-data";

export const revalidate = 120;

export default async function HomePage() {
  const { confirmedPilots, sessions } = await getLandingData();

  return (
    <main>
      <HeroSection />
      <EventInfoSection />
      <CountersSection />
      <TrophiesSection />
      <SocialFeedSection />
      <OfficialTrainingsSection initialSessions={sessions} />
      <FinalCtaSection initialConfirmedPilots={confirmedPilots} />
    </main>
  );
}