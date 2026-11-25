import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { TdRoot } from "@/components/td"
import { Preview } from "./Preview"

export const metadata: Metadata = {
  title: "Design preview · Threadda",
  robots: { index: false, follow: false },
}

/** Development-only style guide for the td components. */
export default function DesignPreviewPage() {
  if (process.env.NODE_ENV === "production") notFound()
  return (
    <TdRoot className="min-h-screen">
      <Preview />
    </TdRoot>
  )
}
