import { ThreaddaLogo } from "./ThreaddaLogo"
import { Line } from "./Line"

const mono = "font-lp-mono uppercase"

const COLUMNS = [
  { title: "Explore", links: [["Workspace", "#product"], ["How it works", "#how"], ["Voice", "#voice"]] },
  { title: "A little more", links: [["Platforms", "#room"], ["Who it’s for", "#who"], ["FAQ", "#faq"]] },
]

export function Footer() {
  return (
    <footer className="mx-auto max-w-[80.4375rem] px-6 sm:px-10 pt-16 pb-[1.625rem] xl:pt-24">
      <div data-stagger className="flex flex-col justify-between gap-12 sm:flex-row">
        <div data-reveal>
          <a href="#" aria-label="Threadda, back to top" className="lp-hover inline-flex">
            <ThreaddaLogo className="text-[1.1875rem] text-lp-ink" />
          </a>
          <p className="mt-[1.3125rem] max-w-[15.75rem] text-[0.8125rem] leading-[1.375rem] text-lp-muted">
            Turn the reading you already do into the writing only you could publish.
          </p>
        </div>
        <div data-reveal className="grid grid-cols-[9.9375rem_auto] sm:-mt-[0.3125rem]">
          {COLUMNS.map((col) => (
            <nav key={col.title} aria-label={col.title}>
              <p className={`${mono} text-[0.625rem] leading-[0.8125rem] tracking-[0.2em] text-lp-muted`}>{col.title}</p>
              <ul className="mt-[1.5rem] space-y-[1.3125rem] text-[0.75rem] leading-[0.9375rem] text-lp-muted">
                {col.links.map(([label, href]) => (
                  <li key={href}><a href={href} className="lp-navlink hover:text-lp-ink">{label}</a></li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
      </div>

      <p aria-hidden="true" data-reveal="lines" className="mt-[5.625rem] select-none whitespace-nowrap text-[min(19.0625rem,calc((100vw-3rem)*0.25))] font-bold leading-[0.8] tracking-[-0.098em] text-lp-ink">
        <Line className="lp-line-loose">threadda<span className="lp-pop ml-[0.03em] inline-block h-[0.102em] w-[0.102em] rounded-full bg-current" /></Line>
      </p>

      <div data-reveal="fade" className={`${mono} mt-[3.5rem] grid gap-3 border-t border-[#dddbd5] pt-[1.5rem] text-[0.625rem] leading-[0.75rem] tracking-[0.12em] text-lp-muted sm:grid-cols-3`}>
        <p>© 2026 Threadda</p>
        <p className="sm:text-center">Read deeply. Think freely. Write like yourself.</p>
        <a href="#" className="lp-hover inline-flex items-center gap-[0.5625rem] transition-colors hover:text-lp-ink sm:justify-self-end">
          Back to the beginning
          <svg aria-hidden="true" viewBox="0 0 10 10" className="lp-nudge-up h-[0.5625rem] w-[0.5625rem]" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 9V1.5M1.8 4.5 5 1.3l3.2 3.2" /></svg>
        </a>
      </div>
    </footer>
  )
}
