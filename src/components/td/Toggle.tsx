"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export type ToggleOption<T extends string> = { value: T; label: React.ReactNode }

export type ToggleProps<T extends string> = {
  /** 2–4 options, shown as equal-width buttons. */
  options: readonly ToggleOption<T>[]
  value: T
  onChange?: (value: T) => void
  /** Names the group for screen readers ("How to teach Folio"). */
  label: string
  className?: string
}

/** Segmented choice (reference .toggle). Selected: blue-wash fill, blue-line border, blue text. */
export function Toggle<T extends string>({ options, value, onChange, label, className }: ToggleProps<T>) {
  if (process.env.NODE_ENV !== "production" && (options.length < 2 || options.length > 4)) {
    console.warn(`Toggle "${label}" has ${options.length} options; use 2–4.`)
  }
  return (
    <div
      role="group"
      aria-label={label}
      className={cn("grid gap-2.5", className)}
      style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}
    >
      {options.map((o) => {
        const on = o.value === value
        return (
          <button
            key={o.value}
            type="button"
            aria-pressed={on}
            onClick={() => onChange?.(o.value)}
            className={cn(
              "h-11 cursor-pointer rounded-td-control border px-3 font-td-sans text-[13px] leading-none font-medium",
              "transition-[background-color,border-color,color] duration-200 ease-td",
              "outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-td-blue",
              on
                ? "border-td-blue-line bg-td-blue-wash text-td-blue"
                : "border-td-toggle-line bg-td-paper text-td-body hover:border-td-ink/30",
            )}
          >
            {o.label}
          </button>
        )
      })}
    </div>
  )
}
