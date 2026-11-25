"use client"

import { useState } from "react"
import { ThreaddaMark } from "./ThreaddaLogo"

/* Illustrative product preview: an HTML/CSS recreation, not a screenshot.
 * All three sources are on the table; the middle column shows the thread that
 * runs through them. Picking a source highlights its row in the thread;
 * picking an angle expands it. */

type Source = {
  kind: string
  teaser: string
  /** The line this source adds to the thread. */
  line: string
}

const SOURCES: Source[] = [
  {
    kind: "Research paper",
    teaser: "Visibility, not competence, predicts who gets promoted",
    line: "Visible work is cited 2.4× more often in promotion talks.",
  },
  {
    kind: "Newsletter essay",
    teaser: "Attention isn't scarce. It's unforgiving.",
    line: "Readers decide in under two seconds whether to keep going.",
  },
  {
    kind: "Saved thread",
    teaser: "The thread you saved and never wrote about",
    line: "The answers live in people, not documents.",
  },
]

const THREAD_TITLE = "Work nobody can retell might as well not exist — in a review, in a feed, or in a team."

type Angle = { tag: string; headline: string; body: string }

const THREAD_ANGLES: Angle[] = [
  {
    tag: "Contrarian",
    headline: "Stop telling people to post more. Tell them to write things down.",
    body: "The promotion study says managers reward what they can recall. The onboarding thread says teams lose whatever nobody wrote. The essay says readers give you two seconds. It's the same lesson three times: work has to be retellable before it can be seen.",
  },
  {
    tag: "Personal",
    headline: "My best quarter was invisible because I never wrote a sentence about it.",
    body: "I shipped the migration that ended a month of outages. It came up once in my review. The study explains why: visible work gets cited 2.4× more often than quiet work. The thread explains the rest: nothing I'd learned was written anywhere anyone could find.",
  },
  {
    tag: "Analytical",
    headline: "Recall is the hidden metric in reviews, feeds and onboarding.",
    body: "Three sources, one mechanism. Managers promote the work they remember. Readers stay for openings they can grasp in two seconds. New hires ramp on what someone wrote down. Each one rewards work that's been made easy to retell.",
  },
]

const VOICE_BARS = [
  { label: "Sentence length", note: "clipped", pct: 61 },
  { label: "Plainspoken", note: "no jargon", pct: 78 },
  { label: "Contrarian", note: "takes a side", pct: 70 },
  { label: "Warmth", note: "measured", pct: 44 },
]

const NOT_IN_VOCABULARY = ["In today's fast-paced world", "Here's the thing:", "Let that sink in.", "Rocket-emoji sign-offs"]

/** Small labels inside the demo follow the app: Manrope 11px/500, sentence case, muted. */
const label = "text-[0.6875rem] font-medium leading-4 text-lp-muted"

function Check({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 12 12" className={className} fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
      <path d="M2.2 6.3 4.8 8.8 9.8 3.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function WorkbenchDemo() {
  // Which source's row is highlighted in the thread. It doesn't change the angles.
  const [focusIdx, setFocusIdx] = useState(0)
  const [angleIdx, setAngleIdx] = useState(0)

  return (
    <div className="mt-8 overflow-hidden rounded-[0.75rem] border border-[#e6e6e6] bg-lp-paper shadow-[0_0.0625rem_0.125rem_rgba(33,35,44,0.04),0_0.625rem_1.75rem_-0.875rem_rgba(33,35,44,0.18)] sm:mt-[2.25rem]">
      {/* ── Window header ── */}
      <div className="flex h-[3.4375rem] items-center justify-between gap-3 border-b border-[#dddbd5] px-4 sm:px-5">
        <div className="flex min-w-0 items-center">
          <ThreaddaMark className="h-[1.125rem] w-[1.125rem] text-lp-ink" />
          <span className="ml-[0.5625rem] text-[0.75rem] font-bold tracking-[-0.01em] text-lp-ink">threadda.</span>
          <span className="mx-[0.9375rem] hidden text-[0.8125rem] text-[#c9c8c0] sm:inline" aria-hidden="true">/</span>
          <span className="hidden text-[0.6875rem] text-lp-muted sm:inline">Home</span>
        </div>
        <span className="flex h-5 shrink-0 items-center gap-1.5 rounded-full border border-[#dddbd5] px-2.5 text-[0.625rem] font-medium text-lp-muted">
          <Check className="h-[0.5625rem] w-[0.5625rem] text-lp-blue" />
          All changes saved
        </span>
      </div>

      <div className="grid md:grid-cols-[11.25rem_1fr_13.125rem]">
        {/* ── Your World (desktop column) ── */}
        <div className="hidden border-r border-[#dddbd5] bg-lp-cream px-[0.75rem] pt-[1.1875rem] pb-6 md:block">
          <div className="flex items-center justify-between px-[0.1875rem]">
            <p className={label}>Your World</p>
            <svg viewBox="0 0 10 10" className="h-[0.625rem] w-[0.625rem] text-lp-muted" fill="none" stroke="currentColor" strokeWidth="1.1" aria-hidden="true">
              <path d="M5 1v8M1 5h8" />
            </svg>
          </div>
          <ul className="mt-[0.8125rem] space-y-1.5" aria-label="Sources on the table">
            {SOURCES.map((s, i) => {
              const on = i === focusIdx
              return (
                <li key={s.kind}>
                  <button
                    type="button"
                    aria-pressed={on}
                    onClick={() => setFocusIdx(i)}
                    className={`block w-full rounded-[0.625rem] border px-[0.75rem] pt-[0.6875rem] pb-3 text-left transition-colors ${
                      on ? "border-[#dddbd5] bg-lp-paper" : "border-transparent hover:bg-lp-paper/60"
                    }`}
                  >
                    <span className={`flex items-center gap-[0.3125rem] text-[0.6875rem] leading-4 ${on ? "font-medium text-lp-blue" : "text-lp-muted"}`}>
                      <Check className="h-[0.5625rem] w-[0.5625rem] shrink-0 text-lp-blue" />
                      {s.kind}
                    </span>
                    <span className="mt-1.5 block pl-[0.875rem] text-[0.6875rem] leading-4 text-lp-muted">{s.teaser}</span>
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

        {/* ── Thread + angles ── */}
        <div className="flex min-w-0 flex-col">
          {/* Your World on phones: a row of source chips */}
          <div className="flex gap-1.5 overflow-x-auto border-b border-[#dddbd5] bg-lp-cream px-3 py-2.5 md:hidden" aria-label="Sources on the table" role="group">
            {SOURCES.map((s, i) => {
              const on = i === focusIdx
              return (
                <button
                  key={s.kind}
                  type="button"
                  aria-pressed={on}
                  onClick={() => setFocusIdx(i)}
                  className={`flex shrink-0 items-center gap-[0.375rem] rounded-full border px-3 py-1.5 text-[0.75rem] ${
                    on ? "border-[#dddbd5] bg-lp-paper font-medium text-lp-blue" : "border-transparent text-lp-muted"
                  }`}
                >
                  <Check className="h-[0.5625rem] w-[0.5625rem] shrink-0 text-lp-blue" />
                  {s.kind}
                </button>
              )
            })}
          </div>

          <div className="border-b border-[#dddbd5] px-4 pt-[1.25rem] pb-[1.1875rem] sm:px-[1.1875rem]" aria-live="polite">
            <p className={label}>The thread · across {SOURCES.length} sources</p>
            <h3 className="mt-[0.5rem] text-[0.9062rem] font-medium leading-5 tracking-[-0.01em] text-lp-ink">{THREAD_TITLE}</h3>
            <ul className="mt-[0.8125rem] space-y-[0.5rem]" aria-label="Where each source sits in the thread">
              {SOURCES.map((s, i) => {
                const on = i === focusIdx
                return (
                  <li
                    key={s.kind}
                    aria-current={on ? "true" : undefined}
                    className={`border-l-2 pl-[0.625rem] motion-safe:transition-colors ${on ? "border-lp-blue" : "border-transparent"}`}
                  >
                    <span className="block text-[0.6875rem] leading-4 text-lp-muted">{s.kind}</span>
                    <span className={`block text-[0.75rem] leading-5 motion-safe:transition-colors ${on ? "text-lp-ink" : "text-lp-muted"}`}>{s.line}</span>
                  </li>
                )
              })}
            </ul>
          </div>

          <div className="flex-1 px-2 pt-[0.8125rem] pb-3 sm:px-[0.6875rem]">
            <div className="flex items-center justify-between px-2 sm:px-[0.375rem]">
              <p className="text-[0.6875rem] text-lp-body">Your next point of view</p>
              <p className="font-lp-mono text-[0.625rem] tracking-[0.05em] text-lp-blue">
                <span className="sr-only">Angle </span>
                {angleIdx + 1} / {THREAD_ANGLES.length}
              </p>
            </div>
            <ul className="mt-[0.5625rem] space-y-1" aria-label="Angles">
              {THREAD_ANGLES.map((a, i) => {
                const on = i === angleIdx
                return (
                  <li key={a.tag}>
                    <button
                      type="button"
                      aria-pressed={on}
                      onClick={() => setAngleIdx(i)}
                      className={`grid w-full grid-cols-[1fr_auto] rounded-[0.75rem] border px-[0.625rem] pt-[1.125rem] pb-3 text-left transition-colors ${
                        on ? "border-[#bbc4f8] bg-[#f5f6fc]" : "border-transparent hover:bg-lp-cream/70"
                      }`}
                    >
                      <span className={`${label} ${on ? "text-lp-blue" : ""}`}>{a.tag}</span>
                      <span className="flex justify-end">{on && <Check className="h-[0.6875rem] w-[0.6875rem] text-lp-blue" />}</span>

                      <span className={`col-span-2 mt-[0.875rem] block text-[0.8125rem] leading-4 ${on ? "text-lp-ink" : "text-lp-body"}`}>
                        {a.headline}
                      </span>
                      {on && (
                        <span className="lp-swap col-span-2 mt-[0.875rem] block border-t border-[#e1e5fa] pt-[0.8125rem] text-[0.75rem] leading-5 text-lp-muted">
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
          <p className={label}>Your voiceprint</p>
          <p className="mt-[0.75rem] text-[0.6875rem] leading-[1.125rem] text-lp-muted">Learned from how you answer and what you&apos;ve written.</p>
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
            <p className={label}>Not in your vocabulary</p>
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
