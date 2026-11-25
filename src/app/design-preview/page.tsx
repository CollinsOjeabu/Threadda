import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { TdRoot } from "@/components/td"
import { Preview } from "./Preview"

export const metadata: Metadata = {
  title: "Design preview · Threadda",
  robots: { index: false, follow: false },
}

/**
 * Style guide for the td components. Hidden only on the live site
 * (VERCEL_ENV "production"); visible in dev, local builds and Vercel previews.
 */
export default function DesignPreviewPage() {
  if (process.env.VERCEL_ENV === "production") notFound()
  return (
    <TdRoot className="min-h-screen">
      <Preview />
    </TdRoot>
  )
}
