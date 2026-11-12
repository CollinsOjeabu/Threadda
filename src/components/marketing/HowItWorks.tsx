import type { ReactNode } from "react"
import { Line, follow } from "./Line"

const ANGLES = [
  { tag: "Contrarian", headline: "Fire the review process, not the quiet people" },
  { tag: "Personal", headline: "The quarter nobody could see" },
  { tag: "Analytical", headline: "The recall problem, in three parts" },
]

function StepCard({ step, tint, title, body, children }: {
  step: string
  tint: string // background + top inset, measured per card from the design
  title: string
  body: string
  children: ReactNode
}) {
  return (
    <li data-reveal className="lp-lift flex flex-col overflow-hidden rounded-[0.875rem] border border-[#dddbd5] bg-lp-paper">
      <div className={`relative h-[15.375rem] border-b border-[#dddbd5] px-[1.75rem] ${tint}`}>
        <p className="absolute left-[1.25rem] top-[1rem] font-lp-mono text-[0.625rem] uppercase tracking-[0.1em] text-[#a4a3a6]">Step {step}</p>
        {children}
      </div>
      <div className="px-[1.75rem] pt-[1.8125rem] pb-[2rem]">
        <h3 className="h-display text-[1.1875rem] leading-[1.625rem] tracking-[-0.035em] text-lp-ink">{title}</h3>
        <p className="mt-[0.8125rem] text-[0.8125rem] leading-[1.5312rem] text-lp-muted">{body}</p>
      </div>
    </li>
  )
}

export function HowItWorks() {
  return (
    <section id="how" aria-labelledby="how-heading" className="bg-[#f2f1ed]">
      <div className="mx-auto max-w-[80.4375rem] px-6 sm:px-10 py-28 xl:py-32">
        <div data-stagger className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div>
            <p data-reveal="fade" className="lp-overline flex items-center gap-3 text-lp-ink"><span className="num text-[#9e9fa0]">(02)</span><span className="rule" aria-hidden="true" />Less prompting. More perspective.</p>
            <h2 id="how-heading" data-reveal="lines" className="h-display text-[clamp(2.4rem,5.5vw,4.3rem)] mt-[1.75rem] leading-[1.06]">
              <Line>A spark. A stance.</Line>
              <Line><span className="serif-i text-lp-ink">Something worth saying.</span></Line>
            </h2>
          </div>
          <p data-reveal className="text-[0.875rem] leading-[1.625rem] text-lp-muted max-w-[16.5rem] lg:mb-[0.1875rem]">
            Three moves. A few minutes, instead of the six-hour &quot;what&apos;s worth saying&quot; brainstorm.
          </p>
        </div>

        <ol data-stagger className="grid lg:grid-cols-3 gap-5 mt-[4.0625rem]">
          <StepCard
            step="01"
            tint="bg-[#eff3ec] pt-[4.0625rem]"
            title="Drop in the source"
            body="Paste an article URL, upload a PDF, or add notes of your own. Threadda reads the whole piece, then works out what's actually arguable in it."
          >
            <div style={follow(0)} className="lp-follow flex h-[3.5rem] items-center justify-center gap-[0.5rem] rounded-[0.625rem] border border-dashed border-[#d3d4d0] bg-[#f8f9f5] text-[0.75rem] text-[#747a82]">
              <svg aria-hidden="true" viewBox="0 0 12 12" className="h-[0.625rem] w-[0.625rem]" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"><path d="M6 1.5v9M1.5 6h9" /></svg>
              Paste a link or drop a PDF
            </div>
            <div style={follow(1)} className="lp-follow mt-[0.5625rem] flex h-[2rem] items-center gap-[0.5625rem] rounded-[0.5625rem] border border-[#ececec] bg-lp-paper pl-[0.6875rem] pr-[0.75rem]">
              <svg aria-hidden="true" viewBox="0 0 12 14" className="h-[0.75rem] w-[0.6875rem] shrink-0 text-lp-blue" fill="none" stroke="currentColor" strokeWidth="1.1" strokeLinejoin="round"><path d="M7.5 1H2.5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h7a1 1 0 0 0 1-1V4L7.5 1Z" /><path d="M7.5 1v3h3M4 7.5h4M4 10h4" strokeLinecap="round" /></svg>
              <span className="min-w-0 truncate text-[0.6875rem] text-[#5d6068]">Visibility, not competence, predicts promotion</span>
              <span className="ml-auto pl-2 font-lp-mono text-[0.625rem] text-[#96979d]">24p</span>
            </div>
            <p style={follow(2)} className="lp-follow mt-[1rem] flex items-center gap-[0.5625rem] pl-[0.6875rem] text-[0.75rem] text-[#777a81]">
              <svg aria-hidden="true" viewBox="0 0 14 14" className="h-[0.6875rem] w-[0.6875rem] shrink-0 text-[#a4a6ab]" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"><path d="M5.5 4H4a3 3 0 0 0 0 6h1.5M8.5 4H10a3 3 0 0 1 0 6H8.5M4.75 7h4.5" /></svg>
              Saved essay · from your library
            </p>
          </StepCard>

          <StepCard
            step="02"
            tint="bg-[#efeef7] pt-[3.0625rem]"
            title="Choose a position"
            body="An angle isn't a topic. Each one is a hook, a claim, the tension it pushes against, how the post unfolds, and why you're the one saying it. Pick the one you'd say out loud."
          >
            <ul className="space-y-[0.4375rem]">
              {ANGLES.map((a, i) => {
                const on = i === 0
                return (
                  <li
                    key={a.tag}
                    style={follow(i)}
                    className={`lp-follow grid grid-cols-[1.3125rem_1fr] items-center rounded-[0.625rem] border pl-[0.625rem] pr-3 ${on ? "h-[3.375rem] border-[#c3c9f5] bg-[#e6e6f6]" : "h-[3.1875rem] border-[#eeeeee] bg-lp-paper"}`}
                  >
                    <span className={`font-lp-mono text-[0.625rem] ${on ? "text-lp-blue" : "text-[#a5a7ac]"}`}>0{i + 1}</span>
                    <span>
                      <span className="block text-[0.625rem] font-medium uppercase leading-[0.6875rem] tracking-[0.12em] text-[#a2a4ac]">{a.tag}</span>
                      <span className={`mt-[0.1875rem] block truncate text-[0.75rem] leading-[0.9375rem] ${on ? "text-[#454752]" : "text-[#9c9da0]"}`}>{a.headline}</span>
                    </span>
                  </li>
                )
              })}
            </ul>
          </StepCard>

          <StepCard
            step="03"
            tint="bg-[#f5f7dd] pt-[4.1875rem]"
            title="Shape it for the room"
            body="The draft arrives in your voice, built for LinkedIn or X. You edit, you decide, you post. Nothing goes out without you."
          >
            <div style={follow(0)} className="lp-follow overflow-hidden rounded-[0.6875rem] border border-[#ececec] bg-lp-paper shadow-[0_0.0625rem_0.125rem_rgba(33,35,44,0.03)]">
              <div className="flex h-[2.25rem] items-center gap-[0.75rem] border-b border-[#f0f0f0] pl-[0.5rem] pr-[0.625rem]">
                <span className="flex h-[1.4375rem] items-center rounded-[0.3125rem] bg-lp-ink px-[0.5rem] text-[0.6875rem] font-medium text-lp-paper">LinkedIn</span>
                <span className="text-[0.6875rem] text-[#8e9096]">X</span>
                <span className="ml-auto font-lp-mono text-[0.625rem] text-[#96979d]">draft</span>
              </div>
              <p className="px-[0.8125rem] pt-[0.6875rem] pb-[0.625rem] text-[0.75rem] leading-[1.0312rem] text-[#6f727a]">
                Everyone read that study as permission to post more. Read it again: managers promoted what they could recall, not what was best.
              </p>
              <div className="flex h-[1.625rem] items-center border-t border-[#eaeae7] bg-lp-cream px-[0.8125rem] font-lp-mono text-[0.625rem] text-lp-muted">
                <span className="text-lp-blue">your voiceprint</span>
                <span aria-hidden="true" className="mx-[0.5rem] h-[0.5625rem] w-px bg-[#d9d9d4]" />
                <span>your angle</span>
                <span className="ml-auto">1,180 char</span>
              </div>
            </div>
          </StepCard>
        </ol>
      </div>
    </section>
  )
}
