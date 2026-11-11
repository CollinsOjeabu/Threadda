export function HowItWorks() {
  return (
    <section id="how" aria-labelledby="how-heading" className="bg-lp-panel">
      <div className="mx-auto max-w-[1320px] px-6 sm:px-10 py-28">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div>
            <p className="lp-overline flex items-center gap-3"><span className="num text-lp-muted">(02)</span><span className="rule" aria-hidden="true" />Less prompting. More perspective.</p>
            <h2 id="how-heading" className="h-display text-[clamp(2.4rem,5.5vw,4.4rem)] mt-6 leading-[1.02]">
              A spark. A stance.<br /><span className="serif-i text-lp-ink">Something worth saying.</span>
            </h2>
          </div>
          <p className="text-[14px] leading-relaxed text-lp-body max-w-[19rem]">
            Three moves. A few minutes, instead of the six-hour &quot;what&apos;s worth saying&quot; brainstorm.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-5 mt-12">
          <div className="rounded-[18px] border border-lp-line-2 bg-lp-paper overflow-hidden">
            <div className="p-5 bg-lp-cream/60 border-b border-lp-line min-h-[160px]">
              <p className="num text-lp-muted">Step 01</p>
              <div className="mt-5 rounded-[10px] border border-dashed border-lp-line-2 py-4 text-center text-[13px] text-lp-muted">+ Paste a link or drop a PDF</div>
              <p className="mt-3 text-[12px] text-lp-muted flex items-center gap-2">
                <span aria-hidden="true" className="w-4 h-4 shrink-0 rounded bg-lp-cream inline-block border border-lp-line" />
                Visibility, not competence, predicts promotion
                <span className="ml-auto num">24p</span>
              </p>
            </div>
            <div className="p-6">
              <h3 className="h-display text-[20px] font-semibold">Drop in the source</h3>
              <p className="mt-2.5 text-[14px] leading-[1.6] text-lp-body">Paste an article URL, upload a PDF, or add notes of your own. Threadda reads the whole piece, then works out what&apos;s actually arguable in it.</p>
            </div>
          </div>

          <div className="rounded-[18px] border border-lp-line-2 bg-lp-paper overflow-hidden">
            <div className="p-5 bg-lp-blue/[0.05] border-b border-lp-line min-h-[160px] space-y-2">
              <p className="num text-lp-muted">Step 02</p>
              <div className="rounded-[10px] border border-lp-blue/30 bg-lp-paper px-3 py-2.5"><p className="num text-lp-blue">01 · Contrarian</p><p className="text-[13px] mt-0.5">Fire the review process, not the quiet people</p></div>
              <div className="rounded-[10px] border border-lp-line-2 bg-lp-paper/70 px-3 py-2.5"><p className="num text-lp-muted">02 · Personal</p><p className="text-[13px] mt-0.5 text-lp-body">The quarter nobody could see</p></div>
            </div>
            <div className="p-6">
              <h3 className="h-display text-[20px] font-semibold">Choose a position</h3>
              <p className="mt-2.5 text-[14px] leading-[1.6] text-lp-body">An angle isn&apos;t a topic. Each one is a hook, a claim, the tension it pushes against, how the post unfolds, and why you&apos;re the one saying it. Pick the one you&apos;d say out loud.</p>
            </div>
          </div>

          <div className="rounded-[18px] border border-lp-line-2 bg-lp-paper overflow-hidden">
            <div className="p-5 bg-lp-lime/20 border-b border-lp-line min-h-[160px]">
              <p className="num text-lp-muted">Step 03</p>
              <div className="mt-3 rounded-[10px] bg-lp-paper border border-lp-line-2 p-3.5">
                <div className="flex gap-2 text-[12px]"><span className="px-2 py-0.5 rounded bg-lp-ink text-lp-cream">LinkedIn</span><span className="px-2 py-0.5 text-lp-muted">X</span></div>
                <p className="mt-2.5 text-[12px] text-lp-body leading-snug">Everyone read that study as permission to post more. Read it again: managers promoted what they could recall, not what was best.</p>
                <p className="mt-3 num text-lp-muted">your voiceprint · your angle · 1,180 char</p>
              </div>
            </div>
            <div className="p-6">
              <h3 className="h-display text-[20px] font-semibold">Shape it for the room</h3>
              <p className="mt-2.5 text-[14px] leading-[1.6] text-lp-body">The draft arrives in your voice, built for LinkedIn or X. You edit, you decide, you post. Nothing goes out without you.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
