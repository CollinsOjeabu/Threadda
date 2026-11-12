import type { ReactNode } from "react"
import { Line, follow } from "./Line"

const mono = "font-lp-mono uppercase"

function Avatar({ size }: { size: string }) {
  return (
    <span aria-hidden="true" className={`${size} inline-flex shrink-0 items-center justify-center rounded-full bg-[#eeede7] text-[0.75rem] text-[#7a7c84]`}>
      MA
    </span>
  )
}

function MoreDots() {
  return (
    <svg aria-hidden="true" viewBox="0 0 14 4" className="h-[0.1875rem] w-[0.8125rem] text-[#9a9ca3]" fill="currentColor">
      <circle cx="2" cy="2" r="1.4" /><circle cx="7" cy="2" r="1.4" /><circle cx="12" cy="2" r="1.4" />
    </svg>
  )
}

function Panel({ tint, name, platform, badge, caption, children }: {
  tint: string
  name: string
  platform: string
  badge: ReactNode
  caption: string
  children: ReactNode
}) {
  return (
    <figure data-reveal className={`lp-lift rounded-[1rem] px-[1.25rem] pt-[2.0625rem] pb-[2.125rem] sm:px-[2rem] ${tint}`}>
      <figcaption className="flex items-center justify-between gap-4">
        <span className="h-display text-[1.375rem] leading-[1.875rem] tracking-[-0.045em] text-lp-ink">
          {name} <span className="serif-i tracking-[-0.02em]">for {platform}.</span>
        </span>
        {badge}
      </figcaption>
      <div style={follow(0)} className="lp-follow mt-[1.625rem] rounded-[0.75rem] border border-[#ededed] bg-lp-paper shadow-[0_0.625rem_1.75rem_-0.625rem_rgba(33,35,44,0.16)]">
        {children}
      </div>
      <p style={follow(1)} className={`lp-follow ${mono} mt-[1.25rem] text-[0.625rem] leading-[0.8125rem] tracking-[0.24em] text-[#8d8d99]`}>{caption}</p>
    </figure>
  )
}

export function MadeForTheRoom() {
  return (
    <section id="room" aria-labelledby="room-heading" className="py-32 xl:py-36">
      <p data-reveal="fade" className="lp-overline flex items-center gap-3"><span className="num text-lp-muted">(04)</span><span className="rule" aria-hidden="true" />Made for the room</p>
      <div data-stagger className="mt-[1.75rem] flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
        <h2 id="room-heading" data-reveal="lines" className="h-display text-[clamp(2.4rem,5.5vw,4.3rem)] leading-[1.06]">
          <Line>Same idea.</Line>
          <Line><span className="serif-i text-lp-ink">Different energy.</span></Line>
        </h2>
        <p data-reveal className="max-w-[15.75rem] text-[0.875rem] leading-[1.6562rem] text-lp-muted lg:-mb-[0.125rem]">
          A LinkedIn post isn&apos;t a stretched-out tweet. An X thread isn&apos;t a chopped-up essay. Your point stays. The delivery adapts.
        </p>
      </div>

      <div data-stagger className="mt-[3rem] grid gap-[1.75rem] lg:grid-cols-2">
        <Panel
          tint="bg-[#e8e6f4]"
          name="The Authority"
          platform="LinkedIn"
          caption="A strong hook. A real argument. Room to breathe."
          badge={
            <span aria-label="LinkedIn" role="img" className="flex h-[1.6875rem] w-[1.75rem] shrink-0 items-center justify-center rounded-[0.25rem] border border-[#c2c1ce] text-[0.9375rem] font-bold leading-none tracking-[-0.02em] text-lp-ink">
              in
            </span>
          }
        >
          <div className="px-[1.25rem] pt-[1.1875rem] pb-[1.375rem]">
            <div className="flex items-start gap-[0.75rem]">
              <Avatar size="h-[2.5rem] w-[2.5rem]" />
              <div className="min-w-0 flex-1 pt-[0.125rem]">
                <p className="text-[0.8125rem] leading-[1.0625rem] text-lp-ink">Maya Aoki</p>
                <p className="text-[0.75rem] leading-[1.125rem] text-lp-muted">Head of Operations · Northwind</p>
                <p className="flex items-center gap-[0.3125rem] text-[0.6875rem] leading-[1.0625rem] text-[#909199]">
                  1h <span aria-hidden="true">·</span>
                  <svg aria-label="Public" role="img" viewBox="0 0 12 12" className="h-[0.625rem] w-[0.625rem]" fill="none" stroke="currentColor" strokeWidth="1"><circle cx="6" cy="6" r="4.6" /><path d="M1.4 6h9.2M6 1.4c1.4 1.4 1.9 3 1.9 4.6S7.4 9.2 6 10.6M6 1.4C4.6 2.8 4.1 4.4 4.1 6s.5 3.2 1.9 4.6" /></svg>
                </p>
              </div>
              <span className="pt-[0.375rem]"><MoreDots /></span>
            </div>
            <div className="mt-[1.0625rem] space-y-[1.4062rem] text-[0.8125rem] leading-[1.4062rem] text-lp-body">
              <p>Three months on a migration nobody asked about. My review said &ldquo;consistent&rdquo;.</p>
              <p>A study of 4,300 reviews just explained why. Managers cited work they could recall 2.4× more often than work of equal value they couldn&apos;t. I had optimised for correctness in a system that rewards memory.</p>
              <p>So I stopped trying to be indispensable and started making the work retellable. The uncomfortable part: it worked.</p>
            </div>
            <div className="mt-[0.9375rem] flex flex-wrap items-center justify-between gap-[0.625rem] border-t border-[#f0f0f0] pt-[0.875rem] font-lp-mono text-[0.625rem] leading-[0.8125rem] text-lp-muted">
              <span className="flex gap-[0.625rem] whitespace-nowrap sm:gap-[1rem]"><span>248 reactions</span><span>31 comments</span></span>
              <span className="whitespace-nowrap">1,180 characters</span>
            </div>
          </div>
        </Panel>

        <Panel
          tint="bg-[#dee6db]"
          name="The Catalyst"
          platform="X"
          caption="One idea per post. Momentum from the first line."
          badge={
            <svg aria-label="X" role="img" viewBox="0 0 24 24" className="h-[1.0625rem] w-[1.0625rem] shrink-0 text-lp-ink" fill="currentColor">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
          }
        >
          <div className="flex gap-[0.75rem] px-[1.25rem] pt-[1.3125rem] pb-[1.3125rem]">
            <Avatar size="h-[2.25rem] w-[2.25rem]" />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-3">
                <p className="text-[0.8125rem] leading-[1.1875rem] text-lp-ink">
                  Maya Aoki <span className="text-[0.75rem] text-lp-muted">@mayaops · 1h</span>
                </p>
                <span className="ml-auto"><MoreDots /></span>
              </div>
              <div className="mt-[0.5625rem] space-y-[1.375rem] text-[0.8125rem] leading-[1.375rem] text-lp-body">
                <p>A study of 4,300 reviews found managers promoted what they could recall 2.4× more often than equally good work they couldn&apos;t.</p>
                <p>Everyone read it as &ldquo;post more&rdquo;.<br />It&apos;s actually a review process that can&apos;t see quiet work.</p>
              </div>
              <p className="mt-[0.75rem] text-[0.75rem] leading-[1rem] text-lp-muted">
                1 / 5 <span aria-hidden="true">·</span> <span className="text-lp-blue">Show this thread</span>
              </p>
              <ul aria-label="Engagement" className="mt-[0.9375rem] flex items-center justify-between border-t border-[#f0f0f0] pt-[0.875rem] text-[0.75rem] leading-[0.875rem] text-[#71747c]">
                <li className="flex items-center gap-[0.4375rem]">
                  <svg aria-label="Replies" role="img" viewBox="0 0 14 14" className="h-[0.75rem] w-[0.75rem]" fill="none" stroke="currentColor" strokeWidth="1.1" strokeLinejoin="round"><path d="M7 1.8c3 0 5.2 2 5.2 4.6S10 11 7 11c-.6 0-1.2-.1-1.7-.2L2 12.3l.8-2.6C2.1 8.8 1.8 7.7 1.8 6.4 1.8 3.8 4 1.8 7 1.8Z" /></svg>38
                </li>
                <li className="flex items-center gap-[0.4375rem]">
                  <svg aria-label="Reposts" role="img" viewBox="0 0 14 14" className="h-[0.75rem] w-[0.75rem]" fill="none" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9.5V4h7M8.3 2.3 10 4 8.3 5.7M11 4.5V10H4M5.7 11.7 4 10l1.7-1.7" /></svg>112
                </li>
                <li className="flex items-center gap-[0.4375rem]">
                  <svg aria-label="Likes" role="img" viewBox="0 0 14 14" className="h-[0.75rem] w-[0.75rem]" fill="none" stroke="currentColor" strokeWidth="1.1" strokeLinejoin="round"><path d="M7 12S1.6 8.8 1.6 5.2A2.8 2.8 0 0 1 7 4a2.8 2.8 0 0 1 5.4 1.2C12.4 8.8 7 12 7 12Z" /></svg>604
                </li>
                <li className="flex items-center gap-[0.4375rem]">
                  <svg aria-label="Views" role="img" viewBox="0 0 14 14" className="h-[0.75rem] w-[0.75rem]" fill="none" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"><path d="M2 12.2h10M3.8 10.5V6M6.2 10.5V2.5M8.6 10.5V5M11 10.5V7.5" /></svg>74k
                </li>
              </ul>
            </div>
          </div>
        </Panel>
      </div>
      <p data-reveal="fade" className={`${mono} mt-[0.9375rem] text-right text-[0.625rem] leading-[0.75rem] tracking-[0.1em] text-[#70759e]`}>Illustrative posts and engagement</p>
    </section>
  )
}
