import { ThreaddaLogo } from "./ThreaddaLogo"

export function Footer() {
  return (
    <footer className="mx-auto max-w-[1320px] px-6 sm:px-10 py-16">
      <div className="grid sm:grid-cols-[1.5fr_1fr_1fr] gap-10">
        <div>
          <ThreaddaLogo className="text-lp-ink text-[21px]" />
          <p className="mt-3 text-[14px] text-lp-body max-w-xs">
            Turn the reading you already do into the writing only you could publish.
          </p>
        </div>
        <nav aria-label="Explore">
          <p className="lp-overline mb-4">Explore</p>
          <ul className="space-y-2.5 text-[14px] text-lp-body">
            <li><a href="#product" className="hover:text-lp-ink">Workspace</a></li>
            <li><a href="#how" className="hover:text-lp-ink">How it works</a></li>
            <li><a href="#voice" className="hover:text-lp-ink">Voice</a></li>
          </ul>
        </nav>
        <nav aria-label="A little more">
          <p className="lp-overline mb-4">A little more</p>
          <ul className="space-y-2.5 text-[14px] text-lp-body">
            <li><a href="#room" className="hover:text-lp-ink">Platforms</a></li>
            <li><a href="#who" className="hover:text-lp-ink">Who it&apos;s for</a></li>
            <li><a href="#faq" className="hover:text-lp-ink">FAQ</a></li>
          </ul>
        </nav>
      </div>
      <p className="num text-lp-muted mt-14 pt-6 border-t border-lp-line-2">© 2026 Threadda · Free during beta</p>
    </footer>
  )
}
