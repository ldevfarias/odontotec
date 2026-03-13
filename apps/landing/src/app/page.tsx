import { Nav } from "@/components/nav";
import { Hero } from "@/components/sections/Hero";
import { Features } from "@/components/sections/Features";
import { HowItWorks } from "@/components/sections/HowItWorks";
import { Pricing } from "@/components/sections/Pricing";
import { MissionAndFooter } from "@/components/sections/Mission";

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <Nav />
      <Hero />
      <Features />
      <HowItWorks />
      <Pricing />
      <MissionAndFooter />
    </main>
  );
}
