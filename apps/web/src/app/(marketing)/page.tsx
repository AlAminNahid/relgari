import { Classes } from "@/components/sections/landing/classes";
import { Cta } from "@/components/sections/landing/cta";
import { DepartureBoard } from "@/components/sections/landing/departure-board/departure-board";
import { Features } from "@/components/sections/landing/features";
import { Hero } from "@/components/sections/landing/hero/hero";
import { HowItWorks } from "@/components/sections/landing/how-it-works";
import { SeatPreview } from "@/components/sections/landing/seat-preview";
import { StatsStrip } from "@/components/sections/landing/stats-strip";

export default function LandingPage() {
  return (
    <>
      <Hero />
      <StatsStrip />
      <DepartureBoard />
      <Features />
      <SeatPreview />
      <HowItWorks />
      <Classes />
      <Cta />
    </>
  );
}
