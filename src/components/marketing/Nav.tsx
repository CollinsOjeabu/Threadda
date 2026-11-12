import Link from "next/link"
import { ThreaddaLogo } from "./ThreaddaLogo"

export function Nav() {
  return (
    <header data-lp-header className="sticky top-0 z-40 bg-lp-cream/85 backdrop-blur-sm border-b border-lp-line">
      <div className="mx-auto max-w-[80.4375rem] px-6 sm:px-10 h-[4.25rem] flex items-center justify-between gap-4">
        <Link href="/" aria-label="Threadda home" className="lp-hover shrink-0 text-lp-ink text-[1.1875rem] sm:text-[1.3125rem] rounded-md">
          <ThreaddaLogo />
        </Link>
        <nav data-lp-nav aria-label="Primary" className="hidden md:flex items-center gap-9 text-[0.875rem] text-lp-body">
          <a href="#product" className="lp-navlink hover:text-lp-ink">Product</a>
          <a href="#how" className="lp-navlink hover:text-lp-ink">How it works</a>
          <a href="#voice" className="lp-navlink hover:text-lp-ink">Voice</a>
          <a href="#faq" className="lp-navlink hover:text-lp-ink">FAQ</a>
        </nav>
        <div className="flex items-center gap-3.5 sm:gap-6">
          <Link href="/sign-in" className="lp-navlink whitespace-nowrap text-[0.8125rem] font-medium text-lp-body hover:text-lp-ink">
            Log in
          </Link>
          <a
            href="#early"
            className="lp-hover lp-press group inline-flex items-center gap-2.5 rounded-full border border-lp-ink/15 pl-4 pr-1.5 py-1.5 text-[0.8125rem] font-medium text-lp-ink hover:border-lp-ink/30 transition whitespace-nowrap"
          >
            Get early access
            <span aria-hidden="true" className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-lp-ink text-lp-cream text-[0.8125rem]"><span className="lp-turn">↗</span></span>
          </a>
        </div>
      </div>
      <span data-lp-progress aria-hidden="true" />
    </header>
  )
}
