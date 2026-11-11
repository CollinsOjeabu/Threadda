export function PointOfView() {
  return (
    <section aria-labelledby="pov-heading" className="lp-on-dark bg-lp-blue text-white">
      <div className="mx-auto max-w-[1320px] px-6 sm:px-10 py-28 text-center">
        <p className="lp-overline text-white/60">The threadda point of view</p>
        <h2 id="pov-heading" className="h-display text-[clamp(3rem,8.5vw,6.3rem)] mt-7 leading-[0.98]">
          Nobody follows you<br />for <span className="serif-i text-lp-lime">the summary.</span>
        </h2>
        <p className="mt-7 text-[15px] leading-relaxed text-white/[0.72]">
          They follow you for what you see in it.<br />We help you find that part.
        </p>
        <a
          href="#early"
          className="inline-block mt-9 text-[14px] font-medium underline underline-offset-4 decoration-white/40 hover:decoration-white"
        >
          Make your point ↗
        </a>
      </div>
    </section>
  )
}
