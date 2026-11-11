const VOICE_BARS = [
  { label: "Sentence length", note: "clipped", width: "w-1/3" },
  { label: "Plainspoken", note: "no jargon", width: "w-4/5" },
  { label: "Contrarian", note: "takes a side", width: "w-2/3" },
  { label: "Warmth", note: "measured", width: "w-2/5" },
]

export function Workbench() {
  return (
    <section id="product" aria-labelledby="product-heading" className="pt-4 pb-14">
      <p className="lp-overline">Meet your new starting point</p>
      <h2 id="product-heading" className="h-display text-[clamp(2rem,5vw,2.9rem)] mt-5 leading-[1.08]">
        From rabbit hole to <span className="serif-i text-lp-ink">point of view.</span>
      </h2>

      {/* Illustrative product mock (HTML/CSS recreation, not a screenshot) */}
      <div className="mt-9 rounded-[20px] bg-lp-paper border border-lp-line-2 shadow-[0_1px_2px_rgba(33,35,44,0.04),0_12px_40px_-12px_rgba(33,35,44,0.10)] overflow-hidden">
        <div className="flex items-center justify-between gap-3 px-5 h-11 border-b border-lp-line text-[12px] text-lp-muted">
          <span className="text-lp-ink font-semibold">
            threadda<span className="text-lp-blue">.</span>
            <span className="font-normal text-lp-muted"> · Your workspace</span>
          </span>
          <span className="num">✓ All changes saved</span>
        </div>
        <div className="grid md:grid-cols-[210px_1fr_230px] text-[13px]">
          <div className="p-5 border-r border-lp-line hidden md:block">
            <p className="lp-overline mb-3">Your reading room</p>
            <div className="rounded-[10px] bg-lp-cream px-3 py-2.5 mb-2">
              <p className="text-lp-blue font-semibold text-[12px]">Research paper</p>
              <p className="text-lp-muted text-[12px] mt-1 leading-snug">Visibility, not competence, predicts who gets promoted</p>
            </div>
            <p className="text-lp-muted px-3 py-2">Newsletter essay</p>
            <p className="text-lp-muted px-3 py-2">Saved thread</p>
            <p className="num text-lp-muted/70 px-3 pt-5">+ Paste any link or PDF</p>
          </div>
          <div className="p-6 md:border-r border-lp-line">
            <p className="num text-lp-muted">Research paper · Organisational Behaviour Journal · 24 pages</p>
            <h3 className="h-display text-[20px] font-semibold mt-2 leading-tight">Visibility, not competence, predicts who gets promoted</h3>
            <p className="text-lp-body mt-3 leading-relaxed">
              Across 4,300 performance reviews, managers cited visible work in promotion discussions{" "}
              <mark className="bg-lp-lime/55 text-inherit px-1 rounded-sm">2.4× more often</mark> than work of equal value done quietly. The effect survived controls for tenure, function and team size.
            </p>
            <div className="mt-5 rounded-[12px] border border-lp-blue/25 bg-lp-blue/[0.04] p-4">
              <p className="num text-lp-blue">01 · Contrarian · LinkedIn</p>
              <p className="mt-1.5 text-lp-ink leading-snug">This isn&apos;t a case for posting more. It&apos;s a case for firing your review process.</p>
            </div>
          </div>
          <div className="p-5 hidden md:block">
            <div className="flex items-center justify-between"><p className="lp-overline">Your voiceprint</p><span className="num text-lp-muted">98%</span></div>
            <p className="text-lp-muted text-[12px] mt-2 mb-4 leading-snug">Learned from the posts you&apos;ve published.</p>
            <div className="space-y-3.5">
              {VOICE_BARS.map((bar) => (
                <div key={bar.label}>
                  <div className="flex justify-between text-[12px]"><span>{bar.label}</span><span className="text-lp-muted">{bar.note}</span></div>
                  <div className="h-[3px] rounded-full bg-lp-line-2 mt-1.5"><div className={`h-[3px] rounded-full bg-lp-blue ${bar.width}`} /></div>
                </div>
              ))}
            </div>
            <p className="lp-overline mt-5">Not in your vocabulary</p>
            <p className="text-lp-muted/70 text-[12px] mt-2 line-through decoration-lp-muted/40 leading-relaxed">
              In today&apos;s fast-paced world · Here&apos;s the thing: · Let that sink in. · Rocket-emoji sign-offs
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
