import { Cta } from "@/components/sections/landing/cta";
import { DepartureBoard } from "@/components/sections/landing/departure-board/departure-board";
import { Hero } from "@/components/sections/landing/hero/hero";
import { HowItWorks } from "@/components/sections/landing/how-it-works";
import { getStations } from "@/services/stations.server";
import { SeatPreview } from "@/components/sections/landing/seat-preview";

export default async function LandingPage() {
  const stations = await getStations();
  return (
    <>
      <Hero stations={stations} />
      <DepartureBoard />
      <SeatPreview />
      <HowItWorks />
      <Cta />
    </>
  );
}
