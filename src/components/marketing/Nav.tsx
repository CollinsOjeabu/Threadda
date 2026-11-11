import Link from "next/link"
import { ThreaddaLogo } from "./ThreaddaLogo"

export function Nav() {
  return (
    <header className="sticky top-0 z-40 bg-lp-cream/85 backdrop-blur-sm border-b border-lp-line">
      <div className="mx-auto max-w-[1320px] px-6 sm:px-10 h-[68px] flex items-center justify-between gap-4">
        <Link href="/" aria-label="Threadda home" className="shrink-0 text-lp-ink text-[19px] sm:text-[21px] rounded-md">
          <ThreaddaLogo />
        </Link>
        <nav aria-label="Primary" className="hidden md:flex items-center gap-9 text-[14px] text-lp-body">
          <a href="#product" className="hover:text-lp-ink">Product</a>
          <a href="#how" className="hover:text-lp-ink">How it works</a>
          <a href="#voice" className="hover:text-lp-ink">Voice</a>
          <a href="#faq" className="hover:text-lp-ink">FAQ</a>
        </nav>
        <div className="flex items-center gap-3.5 sm:gap-6">
          <Link href="/sign-in" className="whitespace-nowrap text-[13px] font-medium text-lp-body hover:text-lp-ink">
            Log in
          </Link>
          <a
            href="#early"
            className="group inline-flex items-center gap-2.5 rounded-full border border-lp-ink/15 pl-4 pr-1.5 py-1.5 text-[13px] font-medium text-lp-ink hover:border-lp-ink/30 transition whitespace-nowrap"
          >
            Get early access
            <span aria-hidden="true" className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-lp-ink text-lp-cream text-[12px]">↗</span>
          </a>
        </div>
      </div>
    </header>
  )
}
