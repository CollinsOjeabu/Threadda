import * as React from "react"
import { cn } from "@/lib/utils"

export function AlertIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      aria-hidden="true"
      className={cn("size-4 shrink-0 text-td-danger", className)}
    >
      <circle cx="8" cy="8" r="6.5" />
      <path d="M8 4.8v3.6" strokeLinecap="round" />
      <circle cx="8" cy="11" r=".6" fill="currentColor" stroke="none" />
    </svg>
  )
}

export type InlineErrorProps = {
  /** What happened, one sentence: "Your payment didn't go through." */
  title: string
  /** How to fix it. */
  children?: React.ReactNode
  className?: string
}

/** An error shown next to the thing that failed (reference .pay-err). */
export function InlineError({ title, children, className }: InlineErrorProps) {
  return (
    <div
      role="alert"
      className={cn(
        "grid grid-cols-[16px_1fr] gap-3 rounded-[12px] border border-td-danger/28 bg-[#fdf8f7] px-[18px] py-4",
        className,
      )}
    >
      <AlertIcon className="mt-0.5" />
      <div>
        <b className="block text-[14px] leading-[1.4] font-semibold text-td-danger">{title}</b>
        {children && <p className="mt-[3px] text-[13.5px] leading-[1.55] text-td-body">{children}</p>}
      </div>
    </div>
  )
}
