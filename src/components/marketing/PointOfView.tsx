import { Line } from "./Line"

/** Hairline curves behind the statement, traced from the design (drawn on a 1901×612 canvas). */
function Threads() {
  return (
    <svg
      aria-hidden="true"
      data-reveal="trigger"
      className="pointer-events-none absolute inset-0 h-full w-full"
      viewBox="0 0 1901 612"
      preserveAspectRatio="xMidYMid slice"
      fill="none"
      stroke="white"
      strokeOpacity="0.14"
      strokeWidth="1"
    >
      <path className="lp-thread" pathLength={1} vectorEffect="non-scaling-stroke" d="M0,413 C70,372 110,357 155,359 C230,362 330,410 420,462 C500,505 560,530 610,528 C680,524 740,480 790,430 C860,345 945,205 1106,-5" />
      <path className="lp-thread" pathLength={1} vectorEffect="non-scaling-stroke" d="M1325,-5 C1352,60 1360,140 1357,200 C1354,300 1335,420 1290,480 C1260,512 1230,520 1205,518 C1140,512 1092,460 1090,395 C1088,330 1110,285 1150,258 C1200,222 1250,190 1300,173 C1370,150 1430,143 1470,144 C1600,150 1760,240 1905,390" />
    </svg>
  )
}

export function PointOfView() {
  return (
    <section aria-labelledby="pov-heading" className="lp-on-dark relative overflow-hidden bg-lp-blue text-white">
      <Threads />
      <div data-stagger className="relative mx-auto max-w-[80.4375rem] px-6 sm:px-10 pt-[6.625rem] pb-[6.875rem] text-center xl:pt-[7.5rem] xl:pb-[7.75rem]">
        <p data-reveal="fade" className="lp-overline text-white/60">The threadda point of view</p>
        <h2 id="pov-heading" data-reveal="lines" className="h-display mt-[2.0625rem] text-[clamp(3rem,8.5vw,6.25rem)] leading-[1.04]">
          <Line>Nobody follows you</Line>
          <Line>for <span className="serif-i tracking-[-0.02em] text-lp-lime">the summary.</span></Line>
        </h2>
        <p data-reveal className="mt-[1.875rem] text-[0.8125rem] leading-[1.5625rem] text-white/[0.66]">
          They follow you for what you see in it.<br />We help you find that part.
        </p>
        <a
          href="#early"
          data-reveal
          className="lp-hover mt-[2rem] inline-flex items-center gap-[0.8125rem] border-b border-white/40 pb-[0.5rem] pl-[0.125rem] pr-[0.125rem] text-[0.75rem] font-medium transition-colors hover:border-white"
        >
          Make your point
          <svg aria-hidden="true" viewBox="0 0 10 10" className="lp-nudge-ne h-[0.5625rem] w-[0.5625rem]" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"><path d="M2 8 8 2M3.5 2H8v4.5" /></svg>
        </a>
      </div>
    </section>
  )
}
