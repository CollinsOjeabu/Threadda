import * as React from "react"
import { cn } from "@/lib/utils"

export type SkeletonProps = React.HTMLAttributes<HTMLDivElement> & {
  /** `heading` is the taller 14px bar used for a first line. */
  variant?: "line" | "heading"
}

/**
 * Loading placeholder bar with a slow sheen (reference-app.html .bar-g).
 * The `td-sheen` keyframes live in globals.css; reduced motion stops them.
 */
export function Skeleton({ variant = "line", className, style, ...props }: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "rounded-[6px] bg-[linear-gradient(90deg,#efeee8_0%,#f7f6f1_40%,#efeee8_80%)] bg-[length:300%_100%] animate-[td-sheen_1.8s_ease-in-out_infinite] motion-reduce:animate-none",
        variant === "heading" ? "h-3.5" : "h-2.5",
        className,
      )}
      style={style}
      {...props}
    />
  )
}
