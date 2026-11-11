export function ThreeMoves() {
  return (
    <div className="pb-16">
      <div className="mt-20 pt-6 border-t border-lp-line-2 flex items-center justify-between lp-overline">
        <span>The thread, in three moves</span>
        <span className="hidden sm:inline">Your world → themes → angles → your voice</span>
      </div>
      <div className="grid md:grid-cols-3">
        <div className="py-9 md:pr-12 md:border-r border-lp-line-2">
          <div className="flex items-center justify-between lp-overline"><span>Source</span><span className="num text-lp-muted">01</span></div>
          <p className="mt-7 text-[17px]">Something you couldn&apos;t stop reading.</p>
          <p className="mt-12 lp-overline text-lp-muted/70">A little input. Infinite possibility.</p>
        </div>
        <div className="py-9 md:px-12 md:border-r border-lp-line-2">
          <div className="flex items-center justify-between lp-overline"><span>Angle</span><span className="num text-lp-muted">02</span></div>
          <p className="mt-7 serif-i text-[20px]">&quot;It isn&apos;t a review. It&apos;s a memory test.&quot;</p>
          <p className="mt-12 lp-overline text-lp-muted/70">Your original angle</p>
        </div>
        <div className="py-9 md:pl-12">
          <div className="flex items-center justify-between lp-overline"><span>Post</span><span className="num text-lp-muted">03</span></div>
          <p className="mt-7 text-[17px]">Ready to make waves.</p>
          <p className="mt-12 lp-overline text-lp-muted/70">Your voice, not a model&apos;s</p>
        </div>
      </div>
    </div>
  )
}
