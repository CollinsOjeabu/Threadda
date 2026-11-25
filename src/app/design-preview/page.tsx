import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { fontVariables } from "@/lib/fonts"
import { cn } from "@/lib/utils"
import { Preview } from "./Preview"

export const metadata: Metadata = {
  title: "Design preview · Threadda",
  robots: { index: false, follow: false },
}

/** Development-only style guide for the td components. */
export default function DesignPreviewPage() {
  if (process.env.NODE_ENV === "production") notFound()
  return (
    <div className={cn("td-root min-h-screen", fontVariables)}>
      <Preview />
    </div>
  )
}
