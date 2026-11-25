import type { Metadata } from "next"
import { SITE_URL } from "@/lib/site"
import { fontVariables } from "@/lib/fonts"
import "./marketing.css"

const TITLE = "Threadda — Turn what you read into a point of view"
const DESCRIPTION =
  "Threadda turns the things you read into a point of view you'd actually post — an opinionated angle, in your own voice, ready for LinkedIn or X."

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: "/",
    siteName: "Threadda",
    title: TITLE,
    description: DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
}

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className={`lp-root min-h-screen ${fontVariables}`}
    >
      {/* html.lp-js is set before first paint by the inline script in the root layout's <head>. */}
      {children}
    </div>
  )
}
