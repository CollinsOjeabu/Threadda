export function Hero() {
  return (
    <div className="pt-[150px]">
      <div className="grid lg:grid-cols-[1.4fr_1fr] gap-10 lg:gap-16 items-end">
        <div>
          <p className="lp-overline flex items-center gap-3 mb-8">
            <span className="rule" aria-hidden="true" />
            For people who read more than they post.
          </p>
          <h1 id="hero-heading" className="h-display text-[clamp(3.6rem,9.2vw,6.8rem)]">
            Good reads.<br />Great <span className="serif-i text-lp-blue">takes.</span>
          </h1>
        </div>
        <div className="pb-3">
          <p className="text-[15px] leading-[1.6] text-lp-body max-w-[26rem]">
            Threadda turns the things you read into a point of view you&apos;d actually post — an opinionated angle, in your own voice, ready for LinkedIn or X.
          </p>
          <div className="mt-7 flex flex-wrap items-center gap-5">
            <a
              href="#early"
              className="inline-flex items-center gap-2 rounded-full bg-lp-blue hover:bg-lp-blue-700 transition text-white pl-6 pr-2 py-2 text-[13px] font-semibold"
            >
              Find your next great post
              <span aria-hidden="true" className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-white/20">↗</span>
            </a>
            <a href="#how" className="text-[13.5px] text-lp-body hover:text-lp-ink underline underline-offset-4 decoration-lp-ink/25">
              Explore Threadda ↓
            </a>
          </div>
          <p className="mt-4 num text-lp-muted">Free during beta. No card, no sales call.</p>
        </div>
      </div>
    </div>
  )
}
