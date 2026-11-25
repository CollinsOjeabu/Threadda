import * as React from "react"
import { cn } from "@/lib/utils"

export type TagProps = React.HTMLAttributes<HTMLSpanElement> & {
  /** Active tags use blue-wash with blue text (DESIGN.md §5). */
  active?: boolean
}

/** Small sentence-case pill: sage fill, Manrope 11px/500. */
export function Tag({ active = false, className, ...props }: TagProps) {
  return (
    <span
      className={cn(
        "inline-flex h-[22px] items-center rounded-td-pill px-[9px] font-td-sans text-[11px] leading-none font-medium",
        active ? "bg-td-blue-wash text-td-blue" : "bg-td-sage text-td-ink",
        className,
      )}
      {...props}
    />
  )
}
