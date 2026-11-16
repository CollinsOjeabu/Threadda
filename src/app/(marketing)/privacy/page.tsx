import type { Metadata } from "next"
import Link from "next/link"
import { ThreaddaLogo } from "@/components/marketing/ThreaddaLogo"
import { Footer } from "@/components/marketing/Footer"

// TODO(launch): replace with the real contact address before going live.
const CONTACT_EMAIL = "[CONTACT EMAIL]"
const LAST_UPDATED = "16 November 2026"

export const metadata: Metadata = {
  title: "Privacy — Threadda",
  description: "What Threadda collects when you join the early access list, why, who processes it, and how to have it deleted.",
  alternates: { canonical: "/privacy" },
  openGraph: { url: "/privacy", title: "Privacy — Threadda" },
}

const h2 = "h-display mt-12 text-[1.375rem] leading-[1.75rem] tracking-[-0.03em] text-lp-ink"
const p = "mt-4 text-[0.9375rem] leading-[1.625rem] text-lp-body"
const li = "text-[0.9375rem] leading-[1.625rem] text-lp-body"

export default function PrivacyPage() {
  return (
    <>
      <header className="border-b border-lp-line bg-lp-cream">
        <div className="mx-auto flex h-[4.25rem] max-w-[80.4375rem] items-center justify-between px-6 sm:px-10">
          <Link href="/" aria-label="Threadda home" className="lp-hover text-[1.1875rem] text-lp-ink sm:text-[1.3125rem]">
            <ThreaddaLogo />
          </Link>
          <Link href="/#early" className="lp-navlink text-[0.8125rem] font-medium text-lp-body hover:text-lp-ink">
            Get early access
          </Link>
        </div>
      </header>

      <main id="main" className="mx-auto max-w-[42rem] px-6 pt-16 pb-24 sm:px-10 xl:pt-24">
        <p className="font-lp-mono text-[0.625rem] uppercase tracking-[0.2em] text-lp-muted">Last updated {LAST_UPDATED}</p>
        <h1 className="h-display mt-5 text-[clamp(2.2rem,5vw,3.25rem)] leading-[1.08] text-lp-ink">Privacy</h1>
        <p className={p}>
          This page explains what happens to your information when you join the Threadda early access list. It is
          short because we collect very little.
        </p>

        <h2 className={h2}>Who we are</h2>
        <p className={p}>
          Threadda is an independent product built and run by Collins Ojeabu, who is responsible for the information
          described here. You can reach us at <span className="font-medium text-lp-ink">{CONTACT_EMAIL}</span>.
        </p>

        <h2 className={h2}>What we collect</h2>
        <p className={p}>When you join the early access list, we store:</p>
        <ul className="mt-3 list-disc space-y-2 pl-5">
          <li className={li}>your email address</li>
          <li className={li}>which platform you publish on (LinkedIn, X, or both)</li>
          <li className={li}>when you joined, and when we sent you an invitation</li>
        </ul>
        <p className={p}>
          We don&apos;t ask for your name, and the landing page uses no analytics or advertising trackers.
        </p>

        <h2 className={h2}>Why we use it</h2>
        <p className={p}>We use your email for two things only:</p>
        <ul className="mt-3 list-disc space-y-2 pl-5">
          <li className={li}>to send you updates about the launch</li>
          <li className={li}>to invite you in when your wave opens</li>
        </ul>
        <p className={p}>
          The platform you choose helps us decide who to invite first. We don&apos;t sell your information, share it
          for marketing, or add you to anyone else&apos;s list.
        </p>

        <h2 className={h2}>Who processes it</h2>
        <p className={p}>A few services run Threadda on our behalf and handle your information only to do that:</p>
        <ul className="mt-3 list-disc space-y-2 pl-5">
          <li className={li}><span className="font-medium text-lp-ink">Convex</span>: our database, where the early access list is stored.</li>
          <li className={li}><span className="font-medium text-lp-ink">Vercel</span>: hosts this website. Like any web host, it handles standard request data such as your IP address.</li>
          <li className={li}><span className="font-medium text-lp-ink">Clerk</span>: sends invitations and manages accounts for people we invite. It uses essential cookies to keep you signed in.</li>
        </ul>
        <p className={p}>These providers may process data outside your country, under their own data protection terms.</p>

        <h2 className={h2}>Deleting your information</h2>
        <p className={p}>
          You can ask us to remove you from the list, or to show or delete what we hold about you, at any time. Email{" "}
          <span className="font-medium text-lp-ink">{CONTACT_EMAIL}</span> from the address you signed up with and
          we&apos;ll take care of it. Otherwise, we keep your details until you ask us to remove them or we close the
          early access list.
        </p>

        <h2 className={h2}>Changes</h2>
        <p className={p}>
          If we change how we use your information, we&apos;ll update this page and the date at the top.
        </p>
      </main>

      <Footer />
    </>
  )
}
