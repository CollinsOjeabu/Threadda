import { Nav } from "@/components/marketing/Nav"
import { Hero } from "@/components/marketing/Hero"
import { ThreeMoves } from "@/components/marketing/ThreeMoves"
import { Workbench } from "@/components/marketing/Workbench"
import { FamiliarFeeling } from "@/components/marketing/FamiliarFeeling"
import { HowItWorks } from "@/components/marketing/HowItWorks"
import { Voice } from "@/components/marketing/Voice"
import { PointOfView } from "@/components/marketing/PointOfView"
import { MadeForTheRoom } from "@/components/marketing/MadeForTheRoom"
import { WhoItsFor } from "@/components/marketing/WhoItsFor"
import { Faq } from "@/components/marketing/Faq"
import { EarlyAccess } from "@/components/marketing/EarlyAccess"
import { Footer } from "@/components/marketing/Footer"
import { LandingMotion } from "@/components/marketing/LandingMotion"

const container = "mx-auto max-w-[80.4375rem] px-6 sm:px-10"

export default function LandingPage() {
  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-full focus:bg-lp-ink focus:px-4 focus:py-2 focus:text-[0.8125rem] focus:text-lp-cream"
      >
        Skip to content
      </a>
      <Nav />
      <main id="main">
        <div className={container}>
          <section aria-labelledby="hero-heading">
            <Hero />
            <ThreeMoves />
          </section>
          <Workbench />
          <FamiliarFeeling />
        </div>
        <HowItWorks />
        <Voice />
        <PointOfView />
        <div className={container}>
          <MadeForTheRoom />
        </div>
        <WhoItsFor />
        <div className={container}>
          <Faq />
        </div>
        <EarlyAccess />
      </main>
      <Footer />
      <LandingMotion />
    </>
  )
}
