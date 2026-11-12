import { WorkbenchDemo } from "./WorkbenchDemo"

/** "Meet your new starting point": sage panel framing an interactive product preview. */
export function Workbench() {
  return (
    <section id="product" aria-labelledby="product-heading" className="pt-4 pb-14 xl:pb-20">
      <div data-reveal="scale" className="rounded-[1.75rem] border border-[#d3dad1] bg-[linear-gradient(180deg,#dee5db,#dbe3d8)] px-4 pt-9 pb-8 sm:px-12 sm:pt-[3.125rem] sm:pb-[2.875rem]">
        <p className="lp-overline">Meet your new starting point</p>

        <div className="mt-[1.375rem] flex items-end justify-between gap-6">
          <h2 id="product-heading" className="h-display text-[clamp(2rem,5vw,2.9rem)] leading-[1.08]">
            From rabbit hole to <span className="serif-i text-lp-ink">point of view.</span>
          </h2>
          <a
            href="#early"
            aria-label="Get early access"
            className="lp-hover mb-1.5 hidden shrink-0 text-lp-ink/75 transition-colors hover:text-lp-ink sm:block"
          >
            <svg viewBox="0 0 24 24" className="lp-nudge-se h-[1.625rem] w-[1.625rem]" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
              <path d="M4 4 20 20M20 7.5V20H7.5" />
            </svg>
          </a>
        </div>

        <WorkbenchDemo />

        <div className="mt-[1.625rem] flex flex-col gap-2 font-lp-mono text-[0.625rem] uppercase tracking-[0.08em] text-lp-muted/85 sm:flex-row sm:items-center sm:justify-between">
          <p className="flex items-center gap-2">
            <svg viewBox="0 0 12 12" className="h-[0.6875rem] w-[0.6875rem]" fill="none" stroke="currentColor" strokeWidth="1" aria-hidden="true">
              <path d="M1.5 1.5 10.5 4.8 6.6 6.6 4.8 10.5Z" strokeLinejoin="round" />
            </svg>
            Try it: pick a source, then an angle
          </p>
          <p>Illustrative product preview</p>
        </div>
      </div>
    </section>
  )
}
