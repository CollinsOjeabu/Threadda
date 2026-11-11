export function MadeForTheRoom() {
  return (
    <section id="room" aria-labelledby="room-heading" className="py-32">
      <p className="lp-overline flex items-center gap-3"><span className="num text-lp-muted">(04)</span><span className="rule" aria-hidden="true" />Made for the room</p>
      <div className="grid lg:grid-cols-[1fr_auto] gap-6 items-end mt-6">
        <h2 id="room-heading" className="h-display text-[clamp(2.4rem,5.5vw,4.4rem)] leading-[1.02]">
          Same idea. <span className="serif-i text-lp-ink">Different energy.</span>
        </h2>
        <p className="text-[14px] leading-relaxed text-lp-body max-w-[20rem]">
          A LinkedIn post isn&apos;t a stretched-out tweet. An X thread isn&apos;t a chopped-up essay. Your point stays. The delivery adapts.
        </p>
      </div>
      <div className="grid md:grid-cols-2 gap-5 mt-12">
        <div className="rounded-[18px] border border-lp-line-2 bg-lp-paper p-6">
          <div className="flex items-center gap-3">
            <span aria-hidden="true" className="w-10 h-10 shrink-0 rounded-full bg-lp-blue/12 inline-flex items-center justify-center text-[13px] text-lp-blue font-semibold">MA</span>
            <div>
              <p className="text-[14px] font-semibold">Maya Aoki</p>
              <p className="text-[12px] text-lp-muted">Head of Operations · Northwind · 1h</p>
            </div>
          </div>
          <p className="mt-4 text-[14px] leading-[1.6] text-lp-body">
            Three months on a migration nobody asked about. My review said &quot;consistent&quot;. A study of 4,300 reviews just explained why. Managers cited work they could recall 2.4× more often than work of equal value they couldn&apos;t.
          </p>
          <p className="mt-4 lp-overline text-lp-muted/70">A strong hook. A real argument. Room to breathe.</p>
        </div>
        <div className="rounded-[18px] border border-lp-line-2 bg-lp-paper p-6">
          <div className="flex items-center gap-3">
            <span aria-hidden="true" className="w-10 h-10 shrink-0 rounded-full bg-lp-ink/10 inline-flex items-center justify-center text-[13px] font-semibold">MA</span>
            <div>
              <p className="text-[14px] font-semibold">Maya Aoki <span className="text-lp-muted font-normal">@mayaops · 1h</span></p>
            </div>
          </div>
          <p className="mt-4 text-[14px] leading-[1.6] text-lp-body">
            A study of 4,300 reviews found managers promoted what they could recall 2.4× more often than equally good work they couldn&apos;t. Everyone read it as &quot;post more&quot;. It&apos;s actually a review process that can&apos;t see quiet work.{" "}
            <span className="text-lp-blue">1/5 · Show this thread</span>
          </p>
          <p className="mt-4 lp-overline text-lp-muted/70">One idea per post. Momentum from the first line.</p>
        </div>
      </div>
      <p className="num text-lp-muted/60 mt-6 text-center">Illustrative posts and engagement</p>
    </section>
  )
}
