const VOICE_BARS = [
  { label: "Sentence length", note: "clipped", width: "w-1/3" },
  { label: "Plainspoken", note: "no jargon", width: "w-4/5" },
  { label: "Contrarian", note: "takes a side", width: "w-2/3" },
  { label: "Warmth", note: "measured", width: "w-2/5" },
]

export function Voice() {
  return (
    <section id="voice" aria-labelledby="voice-heading" className="lp-on-dark bg-lp-navy text-white">
      <div className="mx-auto max-w-[1320px] px-6 sm:px-10 py-28">
        <div className="grid lg:grid-cols-2 gap-16 items-start">
          <div>
            <p className="lp-overline flex items-center gap-3 text-white/50">
              <span className="num">(03)</span>
              <span className="rule bg-white/30" aria-hidden="true" />
              Your voice is the whole point
            </p>
            <h2 id="voice-heading" className="h-display text-[clamp(2.8rem,6.5vw,4.6rem)] mt-7 leading-[1.0]">
              Sound like <span className="serif-i text-lp-lime">yourself.</span><br />Not everyone.
            </h2>
            <p className="mt-7 text-[15px] leading-[1.65] max-w-[25rem] text-white/[0.62]">
              Your sentence rhythm. The side you take. The words you&apos;d never use. Threadda learns from your published writing, so every draft starts a little closer to you.
            </p>
            <div className="grid sm:grid-cols-2 gap-x-12 gap-y-6 mt-11 max-w-[30rem]">
              {VOICE_BARS.map((bar) => (
                <div key={bar.label}>
                  <div className="flex justify-between gap-3 text-[13px]"><span>{bar.label}</span><span className="text-white/40">{bar.note}</span></div>
                  <div className="h-[3px] rounded-full bg-white/15 mt-2"><div className={`h-[3px] rounded-full bg-lp-lime ${bar.width}`} /></div>
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-4 lg:pt-6">
            <div className="rounded-[18px] border border-lp-navy-line bg-lp-navy-card/50 p-6">
              <p className="lp-overline text-white/35">— Everyone else&apos;s AI</p>
              <p className="mt-3 text-[15px] leading-[1.6] line-through decoration-white/20 text-white/[0.38]">
                In today&apos;s fast-paced world, visibility is the key to career growth. Here&apos;s the thing: your work speaks for itself — or does it? Let that sink in.
              </p>
            </div>
            <div className="rounded-[18px] border border-lp-navy-line bg-lp-navy-card p-6">
              <div className="flex items-center justify-between gap-3">
                <p className="lp-overline text-lp-lime">Unmistakably you</p>
                <span className="num px-2.5 py-1 rounded-full border border-lp-navy-line text-white/50">Your voiceprint</span>
              </div>
              <p className="mt-4 text-[15px] leading-[1.6] text-white/85">
                Managers promoted what they could recall, not what was best. A 2.4× gap, and nobody in that study did anything wrong — they just remembered the work someone made memorable.
              </p>
              <p className="mt-5 serif-i text-[21px] text-white">If your review process can&apos;t see quiet work, it isn&apos;t a review. It&apos;s a memory test.</p>
              <p className="mt-5 pt-5 border-t border-lp-navy-line text-[13px] text-white/50">✓ Your rhythm. Your stance. Your words.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
