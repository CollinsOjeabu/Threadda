import { EarlyAccessForm } from "./EarlyAccessForm"
import { Line, delay } from "./Line"

const PERKS = ["Free for the length of the beta", "One email when your wave opens", "No card, no sales call"]

export function EarlyAccess() {
  return (
    <section id="early" aria-labelledby="early-heading" className="bg-lp-lime">
      <div className="mx-auto max-w-[80.4375rem] px-6 sm:px-10 py-28 xl:py-32">
        <div className="grid items-center gap-14 lg:grid-cols-[1fr_31.625rem]">
          <div data-stagger>
            <p data-reveal="fade" className="lp-overline flex items-center gap-[0.625rem] text-lp-ink">
              <span aria-hidden="true" className="lp-pop h-[0.3125rem] w-[0.3125rem] rounded-full bg-lp-blue" />
              A new chapter starts here
            </p>
            <h2 id="early-heading" data-reveal="lines" className="h-display mt-[1.9375rem] text-[clamp(2.4rem,5.5vw,4.3rem)] leading-[1.06] text-lp-ink">
              <Line>Your next great</Line>
              <Line>post is already</Line>
              <Line><span className="serif-i">in your tabs.</span></Line>
            </h2>
            <p data-reveal className="mt-[1.5625rem] max-w-[17.75rem] text-[0.8125rem] leading-[1.625rem] text-lp-ink/60">
              Let&apos;s get it out into the world. Join the early access list — we open in small waves and write once when yours comes up.
            </p>
            <ul data-reveal className="mt-[1.6875rem] space-y-[0.6875rem] text-[0.75rem] leading-[0.9688rem] text-lp-ink/65">
              {PERKS.map((perk) => (
                <li key={perk} className="flex items-center gap-[0.5625rem]">
                  <svg aria-hidden="true" viewBox="0 0 12 12" className="h-[0.625rem] w-[0.625rem] shrink-0 text-lp-blue" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2.5 6.5 5 9l4.5-6" /></svg>
                  {perk}
                </li>
              ))}
            </ul>
            <svg aria-hidden="true" data-reveal="fade" viewBox="0 0 24 24" className="lp-point ml-[0.5625rem] mt-[2.5rem] h-[2.4375rem] w-[2.4375rem] text-lp-ink/55" fill="none" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4 20 20M20 7.5V20H7.5" /></svg>
          </div>
          <div data-reveal="scale" style={delay(150)}>
            <EarlyAccessForm />
          </div>
        </div>
      </div>
    </section>
  )
}
