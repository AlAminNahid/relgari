import { Cta } from "@/components/sections/landing/cta";
import { DepartureBoard } from "@/components/sections/landing/departure-board/departure-board";
import { Hero } from "@/components/sections/landing/hero/hero";
import { HowItWorks } from "@/components/sections/landing/how-it-works";
import { SeatPreview } from "@/components/sections/landing/seat-preview";

export default function LandingPage() {
  return (
    <>
      <Hero />
      <DepartureBoard />
      <SeatPreview />
      <HowItWorks />
      <Cta />
    </>
  );
}
