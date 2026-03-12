import { EventInfoSection } from "@/components/event-info";
import { HeroSection } from "@/components/hero";
import { HomeAfterDataSections, HomeBelowFold } from "@/components/home/home-below-fold";
import { Suspense } from "react";

export const revalidate = 60;

export default function HomePage() {
  return (
    <>
      <main className="space-y-20 md:space-y-28">
        <HeroSection />
        <EventInfoSection />
        <Suspense fallback={<section aria-label="Cargando entrenamientos y reserva" className="px-4 py-20" />}>
          <HomeBelowFold />
        </Suspense>
        <HomeAfterDataSections />
      </main>
    </>
  );
}