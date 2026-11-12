import { EarlyAccessForm } from "./EarlyAccessForm"

export function EarlyAccess() {
  return (
    <section id="early" aria-labelledby="early-heading" className="bg-lp-lime">
      <div className="mx-auto max-w-[1320px] px-6 sm:px-10 py-28">
        <div className="grid lg:grid-cols-2 gap-14 items-center">
          <div>
            <p className="lp-overline text-lp-ink/55">A new chapter starts here</p>
            <h2 id="early-heading" className="h-display text-[clamp(2.4rem,6vw,4rem)] mt-5 text-lp-ink leading-[1.02]">
              Your next great post is <span className="serif-i">already in your tabs.</span>
            </h2>
            <p className="mt-6 text-[15px] leading-[1.6] max-w-[26rem] text-lp-ink/70">
              Let&apos;s get it out into the world. Join the early access list — we open in small waves and write once when yours comes up.
            </p>
            <ul className="mt-6 space-y-2 text-[14px] text-lp-ink/80">
              <li>✓ Free for the length of the beta</li>
              <li>✓ One email when your wave opens</li>
              <li>✓ No card, no sales call</li>
            </ul>
          </div>
          <EarlyAccessForm />
        </div>
      </div>
    </section>
  )
}
