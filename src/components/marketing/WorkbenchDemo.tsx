"use client"

import { useState } from "react"
import { ThreaddaMark } from "./ThreaddaLogo"

/* Illustrative product preview: an HTML/CSS recreation, not a screenshot.
 * Picking a source swaps the middle column; picking an angle expands it. */

type Angle = { tag: string; platform: string; headline: string; body: string }
type Source = {
  kind: string
  teaser: string
  meta: [string, string]
  title: string
  paragraph: { before: string; highlight: string; after: string }
  angles: [Angle, Angle, Angle]
}

const SOURCES: Source[] = [
  {
    kind: "Research paper",
    teaser: "Visibility, not competence, predicts who gets promoted",
    meta: ["Research paper", "Organisational Behaviour Journal · 24 pages"],
    title: "Visibility, not competence, predicts who gets promoted",
    paragraph: {
      before: "Across 4,300 performance reviews, managers cited visible work in promotion discussions ",
      highlight: "2.4× more often",
      after: " than work of equal value done quietly. The effect survived controls for tenure, function and team size.",
    },
    angles: [
      {
        tag: "Contrarian",
        platform: "LinkedIn · 1,180",
        headline: "This isn't a case for posting more. It's a case for firing your review process.",
        body: "Everyone read that study as permission to post more. Read it again: managers promoted what they could recall, not what was best. That's not a marketing lesson — it's a management failure with a 2.4× multiplier.",
      },
      {
        tag: "Personal",
        platform: "X · 240",
        headline: "The quarter I did my best work and nobody could see it.",
        body: "I shipped the migration that ended a month of outages. It came up once in my review, as a footnote. The research says that's not bad luck — quiet work is cited 2.4× less often.",
      },
      {
        tag: "Analytical",
        platform: "LinkedIn · 1,340",
        headline: "The 2.4× gap has a name: the recall problem.",
        body: "Managers don't promote the best work; they promote the work they can remember in the room. Three fixes that don't involve posting more: written wins, peer nominations, and reviews that start from the work log.",
      },
    ],
  },
  {
    kind: "Newsletter essay",
    teaser: "Attention isn't scarce. It's unforgiving.",
    meta: ["Newsletter essay", "Working Notes · 9 min read"],
    title: "Attention isn't scarce. It's unforgiving.",
    paragraph: {
      before: "Readers decide whether to keep going in ",
      highlight: "under two seconds",
      after: ". The essay argues that feeds don't punish long posts — they punish vague openings. Length was never the problem; the first line was.",
    },
    angles: [
      {
        tag: "Contrarian",
        platform: "LinkedIn · 1,020",
        headline: "Stop shortening your posts. Start sharpening your first line.",
        body: "Every \"keep it short\" tip treats length as the enemy. The essay says the opposite: readers stay for long posts that earn the first two seconds. Cut the throat-clearing, not the substance.",
      },
      {
        tag: "Personal",
        platform: "X · 230",
        headline: "I cut the intro from my last ten posts. Nothing else changed.",
        body: "No new topics, no new format — I just deleted the first sentence each time. The posts that worked had always started on their second line.",
      },
      {
        tag: "Analytical",
        platform: "LinkedIn · 1,290",
        headline: "Two seconds is the whole budget. Here's how to spend it.",
        body: "If the opening decides everything, it deserves the most work: lead with the claim, put the number up front, and save the context for the people who have already chosen to stay.",
      },
    ],
  },
  {
    kind: "Saved thread",
    teaser: "The thread you saved and never wrote about",
    meta: ["Saved thread", "X · 14 posts"],
    title: "Most teams don't have a knowledge problem. They have a write-it-down problem.",
    paragraph: {
      before: "A 14-post thread on why onboarding takes months: the answers exist, but ",
      highlight: "they live in people, not documents",
      after: ". Every departure resets the clock, and every new hire asks the same questions again.",
    },
    angles: [
      {
        tag: "Contrarian",
        platform: "LinkedIn · 1,150",
        headline: "Your wiki isn't out of date. It was never written.",
        body: "Teams blame stale documentation, but the thread shows the real gap: the knowledge never left anyone's head. You can't maintain what nobody wrote down.",
      },
      {
        tag: "Personal",
        platform: "X · 250",
        headline: "My first month at a new job was mostly asking questions someone had already answered.",
        body: "Every answer existed — in a colleague's head, in a call I wasn't on. I wrote each one down as I learned it. By month three, new hires were reading my notes.",
      },
      {
        tag: "Analytical",
        platform: "LinkedIn · 1,310",
        headline: "Onboarding time measures how much your team never wrote down.",
        body: "Count the questions a new hire asks in week one. Each repeat is a missing page. The fix isn't a better wiki tool — it's making writing it down part of finishing the work.",
      },
    ],
  },
]

const VOICE_BARS = [
  { label: "Sentence length", note: "clipped", pct: 61 },
  { label: "Plainspoken", note: "no jargon", pct: 78 },
  { label: "Contrarian", note: "takes a side", pct: 70 },
  { label: "Warmth", note: "measured", pct: 44 },
]

const NOT_IN_VOCABULARY = ["In today's fast-paced world", "Here's the thing:", "Let that sink in.", "Rocket-emoji sign-offs"]

const mono = "font-lp-mono uppercase"
const pad2 = (n: number) => String(n).padStart(2, "0")

function Check({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 12 12" className={className} fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
      <path d="M2.2 6.3 4.8 8.8 9.8 3.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function WorkbenchDemo() {
  const [sourceIdx, setSourceIdx] = useState(0)
  const [angleIdx, setAngleIdx] = useState(0)
  const source = SOURCES[sourceIdx]

  const pickSource = (i: number) => {
    setSourceIdx(i)
    setAngleIdx(0)
  }

  return (
    <div className="mt-8 overflow-hidden rounded-[0.75rem] border border-[#e6e6e6] bg-lp-paper shadow-[0_0.0625rem_0.125rem_rgba(33,35,44,0.04),0_0.625rem_1.75rem_-0.875rem_rgba(33,35,44,0.18)] sm:mt-[2.25rem]">
      {/* ── Window header ── */}
      <div className="flex h-[3.4375rem] items-center justify-between gap-3 border-b border-[#dddbd5] px-4 sm:px-5">
        <div className="flex min-w-0 items-center">
          <ThreaddaMark className="h-[1.125rem] w-[1.125rem] text-lp-blue" />
          <span className="ml-[0.5625rem] text-[0.75rem] font-bold tracking-[-0.01em] text-lp-ink">threadda.</span>
          <span className="mx-[0.9375rem] hidden text-[0.8125rem] text-[#c9c8c0] sm:inline" aria-hidden="true">/</span>
          <span className="hidden text-[0.6875rem] text-lp-muted sm:inline">Your workspace</span>
        </div>
        <span className="flex h-5 shrink-0 items-center gap-1.5 rounded-full border border-[#dddbd5] px-2.5 font-lp-mono text-[0.625rem] tracking-[0.04em] text-lp-muted">
          <Check className="h-[0.5625rem] w-[0.5625rem] text-lp-blue" />
          All changes saved
        </span>
      </div>

      <div className="grid md:grid-cols-[11.25rem_1fr_13.125rem]">
        {/* ── Reading room (desktop column) ── */}
        <div className="hidden border-r border-[#dddbd5] bg-lp-cream px-[0.75rem] pt-[1.1875rem] pb-6 md:block">
          <div className="flex items-center justify-between px-[0.1875rem]">
            <p className={`${mono} text-[0.625rem] tracking-[0.05em] text-lp-muted`}>Your reading room</p>
            <svg viewBox="0 0 10 10" className="h-[0.625rem] w-[0.625rem] text-lp-muted" fill="none" stroke="currentColor" strokeWidth="1.1" aria-hidden="true">
              <path d="M5 1v8M1 5h8" />
            </svg>
          </div>
          <ul className="mt-[0.8125rem] space-y-1.5" aria-label="Sources">
            {SOURCES.map((s, i) => {
              const on = i === sourceIdx
              return (
                <li key={s.kind}>
                  <button
                    type="button"
                    aria-pressed={on}
                    onClick={() => pickSource(i)}
                    className={`block w-full rounded-[0.625rem] border px-[0.75rem] pt-[0.6875rem] pb-3 text-left transition-colors ${
                      on ? "border-[#dddbd5] bg-lp-paper" : "border-transparent hover:bg-lp-paper/60"
                    }`}
                  >
                    <span className={`flex items-center gap-[0.25rem] text-[0.6875rem] leading-4 ${on ? "font-medium text-lp-blue" : "text-lp-muted"}`}>
                      <span className={`h-[0.25rem] w-[0.25rem] rounded-full ${on ? "bg-lp-blue" : "bg-[#c9c8c0]"}`} aria-hidden="true" />
                      {s.kind}
                    </span>
                    <span className="mt-1.5 block pl-[0.5rem] text-[0.6875rem] leading-4 text-lp-muted">{s.teaser}</span>
                  </button>
                </li>
              )
            })}
          </ul>
          <div className="mt-[1.375rem] flex items-center gap-1.5 border-t border-[#dddbd5] pt-[1.0625rem] pl-[0.25rem] text-[0.6875rem] text-lp-muted">
            <svg viewBox="0 0 14 14" className="h-[0.6875rem] w-[0.6875rem]" fill="none" stroke="currentColor" strokeWidth="1.2" aria-hidden="true">
              <path d="M5.5 8.5 8.5 5.5M6 3.5l1-1a2.5 2.5 0 0 1 3.5 3.5l-1 1M8 10.5l-1 1A2.5 2.5 0 0 1 3.5 8l1-1" strokeLinecap="round" />
            </svg>
            Paste any link or PDF
          </div>
        </div>

        {/* ── Source + angles ── */}
        <div className="flex min-w-0 flex-col">
          {/* Reading room on phones: a row of source tabs */}
          <div className="flex gap-1.5 overflow-x-auto border-b border-[#dddbd5] bg-lp-cream px-3 py-2.5 md:hidden" aria-label="Sources" role="group">
            {SOURCES.map((s, i) => {
              const on = i === sourceIdx
              return (
                <button
                  key={s.kind}
                  type="button"
                  aria-pressed={on}
                  onClick={() => pickSource(i)}
                  className={`flex shrink-0 items-center gap-[0.375rem] rounded-full border px-3 py-1.5 text-[0.75rem] ${
                    on ? "border-[#dddbd5] bg-lp-paper font-medium text-lp-blue" : "border-transparent text-lp-muted"
                  }`}
                >
                  <span className={`h-[0.25rem] w-[0.25rem] rounded-full ${on ? "bg-lp-blue" : "bg-[#c9c8c0]"}`} aria-hidden="true" />
                  {s.kind}
                </button>
              )
            })}
          </div>

          <div className="border-b border-[#dddbd5] px-4 pt-[1.25rem] pb-[1.1875rem] sm:px-[1.1875rem]" aria-live="polite">
            <div key={source.kind} className="lp-swap">
            <p className={`${mono} text-[0.625rem] tracking-[0.05em] text-lp-muted`}>
              {source.meta[0]}
              <span className="mx-2 text-[#c9c8c0]" aria-hidden="true">/</span>
              {source.meta[1]}
            </p>
            <h3 className="mt-[0.5rem] text-[0.9062rem] font-medium leading-5 tracking-[-0.01em] text-lp-ink">{source.title}</h3>
            <p className="mt-[0.8125rem] text-[0.75rem] leading-5 text-lp-muted">
              {source.paragraph.before}
              <mark className="rounded-[0.125rem] bg-lp-lime px-[0.125rem] text-lp-ink">{source.paragraph.highlight}</mark>
              {source.paragraph.after}
            </p>
            </div>
          </div>

          <div className="flex-1 px-2 pt-[0.8125rem] pb-3 sm:px-[0.6875rem]">
            <div className="flex items-center justify-between px-2 sm:px-[0.375rem]">
              <p className="text-[0.6875rem] text-lp-body">Your next point of view</p>
              <p className="font-lp-mono text-[0.625rem] tracking-[0.05em] text-lp-blue">
                <span className="sr-only">Angle </span>
                {angleIdx + 1} / {source.angles.length}
              </p>
            </div>
            <ul key={source.kind} className="lp-swap mt-[0.5625rem] space-y-1" aria-label="Angles">
              {source.angles.map((a, i) => {
                const on = i === angleIdx
                return (
                  <li key={source.kind + a.tag}>
                    <button
                      type="button"
                      aria-pressed={on}
                      onClick={() => setAngleIdx(i)}
                      className={`grid w-full grid-cols-[1.4375rem_1fr_auto] rounded-[0.75rem] border px-[0.625rem] pt-[1.125rem] pb-3 text-left transition-colors ${
                        on ? "border-[#bbc4f8] bg-[#f5f6fc]" : "border-transparent hover:bg-lp-cream/70"
                      }`}
                    >
                      <span className={`font-lp-mono text-[0.625rem] leading-[0.75rem] ${on ? "text-lp-blue" : "text-lp-muted/80"}`}>{pad2(i + 1)}</span>
                      <span className="flex items-center text-[0.625rem] leading-[0.75rem]">
                        <span className={`${mono} tracking-[0.06em] ${on ? "text-lp-blue" : "text-lp-muted"}`}>{a.tag}</span>
                        <span className="mx-2 text-[#c9c8c0]" aria-hidden="true">/</span>
                        <span className="text-lp-muted">{a.platform}</span>
                      </span>
                      <span className="flex justify-end">{on && <Check className="h-[0.6875rem] w-[0.6875rem] text-lp-blue" />}</span>

                      <span className={`col-start-2 col-span-2 mt-[0.875rem] block text-[0.8125rem] leading-4 ${on ? "text-lp-ink" : "text-lp-body"}`}>
                        {a.headline}
                      </span>
                      {on && (
                        <span className="lp-swap col-start-2 col-span-2 mt-[0.875rem] block border-t border-[#e1e5fa] pt-[0.8125rem] text-[0.75rem] leading-5 text-lp-muted">
                          {a.body}
                        </span>
                      )}
                    </button>
                  </li>
                )
              })}
            </ul>
          </div>

          <div className="flex min-h-[3.125rem] flex-wrap items-center justify-between gap-x-4 gap-y-2 border-t border-[#dddbd5] bg-lp-cream px-4 py-3 sm:px-[0.9375rem] sm:py-0">
            <p className="text-[0.625rem] text-lp-muted">Hook · claim · tension · structure · why it&apos;s you</p>
            <a
              href="#early"
              className="inline-flex h-[1.625rem] items-center gap-1.5 rounded-full bg-lp-blue px-3 text-[0.6875rem] font-semibold text-white transition-colors hover:bg-lp-blue-700"
            >
              <svg viewBox="0 0 12 12" className="h-[0.625rem] w-[0.625rem]" fill="currentColor" aria-hidden="true">
                <path d="M5 0.5 6 3.6 9 4.6 6 5.6 5 8.7 4 5.6 1 4.6 4 3.6Z" />
                <path d="M9.4 7.2 9.9 8.6 11.3 9.1 9.9 9.6 9.4 11 8.9 9.6 7.5 9.1 8.9 8.6Z" />
              </svg>
              Draft in your voice
            </a>
          </div>
        </div>

        {/* ── Voiceprint ── */}
        <div className="border-t border-[#dddbd5] bg-lp-cream px-4 pt-4 pb-6 sm:px-[0.9375rem] md:border-t-0 md:border-l">
          <div className="flex items-center justify-between">
            <p className={`${mono} text-[0.625rem] tracking-[0.05em] text-lp-muted`}>Your voiceprint</p>
            <span className="flex h-5 items-center rounded-full bg-[#dee5db] px-2 font-lp-mono text-[0.625rem] text-lp-ink">Voice DNA</span>
          </div>
          <p className="mt-[0.75rem] text-[0.6875rem] leading-[1.125rem] text-lp-muted">Learned from the posts you&apos;ve published.</p>
          <ul className="mt-6 space-y-[0.9375rem]">
            {VOICE_BARS.map((b) => (
              <li key={b.label}>
                <div className="flex items-baseline justify-between">
                  <span className="text-[0.625rem] leading-3 text-lp-body">{b.label}</span>
                  <span className="text-[0.625rem] leading-3 text-lp-muted">{b.note}</span>
                </div>
                <div className="mt-[0.625rem] h-[0.125rem] bg-[#e1e1dd]" aria-hidden="true">
                  <div className="h-[0.125rem] bg-lp-blue" style={{ width: `${b.pct}%` }} />
                </div>
              </li>
            ))}
          </ul>
          <div className="mt-[1.75rem] border-t border-[#dddbd5] pt-[1rem]">
            <p className={`${mono} text-[0.625rem] tracking-[0.05em] text-lp-muted`}>Not in your vocabulary</p>
            <ul className="mt-[0.375rem]">
              {NOT_IN_VOCABULARY.map((w) => (
                <li key={w} className="text-[0.625rem] leading-[1.3125rem] text-lp-muted/80 line-through decoration-lp-muted/70">
                  {w}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
