import type { Metadata } from "next"
import { Manrope, Instrument_Serif, IBM_Plex_Mono } from "next/font/google"
import { SITE_URL } from "@/lib/site"
import "./marketing.css"

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-manrope",
  display: "swap",
})

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: "italic",
  variable: "--font-instrument-serif",
  display: "swap",
})

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-plex-mono",
  display: "swap",
})

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
      className={`lp-root min-h-screen ${manrope.variable} ${instrumentSerif.variable} ${plexMono.variable}`}
    >
      {children}
    </div>
  )
}
