import { CountersSection } from "@/components/counters";
import { EventInfoSection } from "@/components/event-info";
import { FinalCtaSection } from "@/components/final-cta";
import { HeroSection } from "@/components/hero";
import { OfficialTrainingsSection } from "@/components/official-trainings";
import { SocialFeedSection } from "@/components/social-feed";
import { TrophiesSection } from "@/components/trophies";
import { getLandingData } from "@/lib/landing-data";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const { confirmedPilots, sessions } = await getLandingData();

  return (
    <main className="space-y-20 md:space-y-28">
      <HeroSection />
      <EventInfoSection />
      <OfficialTrainingsSection initialSessions={sessions} />
      <div aria-hidden className="mx-auto h-px w-full max-w-6xl bg-gradient-to-r from-transparent via-amber-300/25 to-transparent" />
      <FinalCtaSection initialConfirmedPilots={confirmedPilots} />
      <div aria-hidden className="mx-auto h-px w-full max-w-6xl bg-gradient-to-r from-transparent via-amber-300/25 to-transparent" />
      <SocialFeedSection />
      <div aria-hidden className="mx-auto h-px w-full max-w-6xl bg-gradient-to-r from-transparent via-amber-300/25 to-transparent" />
      <CountersSection />
      <div aria-hidden className="mx-auto h-px w-full max-w-6xl bg-gradient-to-r from-transparent via-amber-300/25 to-transparent" />
      <TrophiesSection />
    </main>
  );
}