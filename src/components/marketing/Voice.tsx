import { Line, follow } from "./Line"

const VOICE_BARS = [
  { label: "Sentence length", note: "clipped", fill: "61%" },
  { label: "Plainspoken", note: "no jargon", fill: "78%" },
  { label: "Contrarian", note: "takes a side", fill: "70%" },
  { label: "Warmth", note: "measured", fill: "44%" },
]

/** Small waveform glyph beside "Unmistakably you". */
function Waveform() {
  const bars = [5, 9, 13, 8, 11, 6, 3]
  return (
    <svg aria-hidden="true" viewBox="0 0 19 14" className="lp-wave h-[0.875rem] w-[1.1875rem] text-lp-blue" fill="currentColor">
      {bars.map((h, i) => (
        <rect key={i} x={i * 2.75} y={(14 - h) / 2} width="1.4" height={h} rx="0.7" />
      ))}
    </svg>
  )
}

export function Voice() {
  return (
    <section id="voice" aria-labelledby="voice-heading" className="lp-on-dark overflow-hidden bg-[#1d2233] text-white">
      <div className="mx-auto max-w-[80.4375rem] px-6 sm:px-10 py-28 xl:py-32">
        <div className="grid items-center gap-16 lg:grid-cols-2 lg:gap-20">
          <div data-stagger>
            <p data-reveal="fade" className="lp-overline flex items-center gap-3 text-[#96989c]">
              <span className="num text-[#4d515d]">(03)</span>
              <span className="rule bg-[#3c3f4d]" aria-hidden="true" />
              Your voice is the whole point
            </p>
            <h2 id="voice-heading" data-reveal="lines" className="h-display mt-[1.9375rem] text-[clamp(2.4rem,5.5vw,4.3rem)] leading-[1.07] text-lp-cream">
              <Line>Sound like</Line>
              <Line><span className="serif-i text-lp-lime">yourself.</span></Line>
              <Line>Not everyone.</Line>
            </h2>
            <p data-reveal className="mt-[1.75rem] max-w-[19.25rem] text-[0.8125rem] leading-[1.5938rem] text-[#96989c]">
              Your sentence rhythm. The side you take. The words you&apos;d never use. Threadda learns from your published writing, so every draft starts a little closer to you.
            </p>

            <div data-reveal className="mt-[2.5rem] border-t border-[#3d414f] pt-[1.75rem]">
              <ul aria-label="Your voiceprint" className="grid gap-x-[2.0625rem] gap-y-[1.625rem] sm:grid-cols-2">
                {VOICE_BARS.map((bar, i) => (
                  <li key={bar.label}>
                    <p className="text-[0.75rem] leading-[0.9375rem] text-[#b2b5b9]">{bar.label}</p>
                    <div className="mt-[0.5625rem] h-[0.125rem] bg-[#3f424f]" aria-hidden="true">
                      <div className="h-full" style={{ width: bar.fill }}>
                        <div className="lp-bar h-full bg-lp-lime" style={follow(i)} />
                      </div>
                    </div>
                    <p className="mt-[0.4375rem] text-[0.625rem] leading-[0.8125rem] text-[#747378]">{bar.note}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Before / after: generic AI copy tucked behind the draft in your voice */}
          <div data-reveal="trigger" className="mx-auto w-full max-w-[29.1875rem]">
            <div className="lp-card-back mx-auto w-[93.5%] -rotate-[3.8deg] rounded-[0.875rem] border border-[#40444f] bg-[#2d3140] px-[1.5rem] pt-[1.6875rem] pb-[1.875rem]">
              <p className="font-lp-mono text-[0.625rem] uppercase tracking-[0.16em] text-[#858888]">— Everyone else&apos;s AI</p>
              <p className="mt-[0.9375rem] text-[0.8125rem] leading-[1.5rem] text-[#8a8c93]">
                <span className="lp-strike">In today&apos;s fast-paced world, visibility is the key to career growth. Here&apos;s the thing: your work speaks for itself — or does it? Let that sink in.</span>
              </p>
            </div>

            <div className="lp-card-front relative -mt-[0.4375rem] rotate-[2deg] rounded-[1rem] bg-lp-paper px-[1.875rem] pt-[1.75rem] pb-[2rem] text-lp-ink shadow-[0_1.75rem_3.75rem_-0.75rem_rgba(6,9,20,0.6)]">
              <div className="flex items-center justify-between gap-3">
                <p className="flex items-center gap-[0.5rem] font-lp-mono text-[0.625rem] uppercase tracking-[0.16em] text-[#2f3240]">
                  <Waveform />
                  Unmistakably you
                </p>
                <span className="rounded-full bg-[#dee5db] px-[0.5rem] py-[0.25rem] font-lp-mono text-[0.625rem] text-lp-ink">Your voiceprint</span>
              </div>
              <p className="mt-[1.375rem] pr-[0.1875rem] text-[0.875rem] leading-[1.6875rem]">
                Managers promoted what they could recall, not what was best. A 2.4× gap, and nobody in that study did anything wrong — they just remembered the work someone made memorable.
              </p>
              <p className="serif-i mt-[1.0625rem] max-w-[24.375rem] text-[1.625rem] leading-[2rem]">
                If your review process can&apos;t see quiet work, it isn&apos;t a review. It&apos;s a memory test.
              </p>
              <p className="mt-[1.5rem] flex items-center gap-[0.5rem] border-t border-[#e4e3dc] pt-[1.0625rem] text-[0.6875rem] text-[#7a7c84]">
                <svg aria-hidden="true" viewBox="0 0 12 12" className="h-[0.625rem] w-[0.625rem] text-lp-blue" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2.5 6.5 5 9l4.5-6" /></svg>
                Your rhythm. Your stance. Your words.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
