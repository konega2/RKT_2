import dynamic from "next/dynamic";

import { CountersSection } from "@/components/counters";
import { FinalCtaSection } from "@/components/final-cta";
import { FooterSection } from "@/components/footer";
import { OfficialTrainingsSection } from "@/components/official-trainings";
import { TrophiesSection } from "@/components/trophies";
import { getLandingData } from "@/lib/landing-data";

const SocialFeedSection = dynamic(
  () => import("@/components/social-feed").then((module) => module.SocialFeedSection),
  {
    ssr: false,
    loading: () => <section aria-label="Novedades" className="px-4 py-16" />,
  },
);

export async function HomeBelowFold() {
  const { confirmedPilots, sessions } = await getLandingData();

  return (
    <>
      <OfficialTrainingsSection initialSessions={sessions} />

      <div aria-hidden className="mx-auto h-px w-full max-w-6xl bg-gradient-to-r from-transparent via-amber-300/25 to-transparent" />

      <FinalCtaSection initialConfirmedPilots={confirmedPilots} />

      <div aria-hidden className="mx-auto h-px w-full max-w-6xl bg-gradient-to-r from-transparent via-amber-300/25 to-transparent" />
    </>
  );
}

export function HomeAfterDataSections() {
  return (
    <>
      <SocialFeedSection />

      <div aria-hidden className="mx-auto h-px w-full max-w-6xl bg-gradient-to-r from-transparent via-amber-300/25 to-transparent" />

      <CountersSection />

      <TrophiesSection />
      <FooterSection />
    </>
  );
}
