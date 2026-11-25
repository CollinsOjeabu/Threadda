"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { AlertIcon } from "./InlineError"

const controlBase = [
  "block w-full rounded-td-control border border-td-field-line bg-td-cream px-3.5 font-td-sans text-[14px] text-td-ink",
  "placeholder:text-td-placeholder outline-none transition-[border-color,background-color] duration-200 ease-td",
  "focus:border-td-blue focus:bg-td-paper",
  "disabled:cursor-not-allowed disabled:opacity-60",
  "aria-[invalid=true]:border-td-danger aria-[invalid=true]:focus:border-td-danger",
]

type FieldFrameProps = {
  id: string
  label: string
  error?: string
  hint?: string
  className?: string
  children: React.ReactNode
}

function FieldFrame({ id, label, error, hint, className, children }: FieldFrameProps) {
  return (
    <div className={cn("flex flex-col gap-2 font-td-sans", className)}>
      <label htmlFor={id} className="text-[12px] leading-[15px] font-medium text-td-ink">
        {label}
      </label>
      {children}
      {hint && !error && (
        <p id={`${id}-hint`} className="m-0 text-[12px] leading-[1.5] text-td-muted">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className="m-0 flex items-start gap-2 text-[12.5px] leading-[1.5] text-td-danger">
          <AlertIcon className="mt-px size-3.5" />
          {error}
        </p>
      )}
    </div>
  )
}

function describedBy(id: string, error?: string, hint?: string, extra?: string) {
  return [error ? `${id}-error` : hint ? `${id}-hint` : null, extra].filter(Boolean).join(" ") || undefined
}

type SharedProps = {
  label: string
  /** A full sentence that says how to fix it. */
  error?: string
  hint?: string
  /** Classes for the wrapper. */
  className?: string
  /** Classes for the input or textarea itself. */
  controlClassName?: string
}

export type FieldProps = SharedProps & Omit<React.InputHTMLAttributes<HTMLInputElement>, "className">

/** Label above a 48px input with cream fill. Focus: blue border, paper fill. */
export function Field({ label, error, hint, className, controlClassName, id, ...props }: FieldProps) {
  const auto = React.useId()
  const fid = id ?? auto
  return (
    <FieldFrame id={fid} label={label} error={error} hint={hint} className={className}>
      <input
        id={fid}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(fid, error, hint, props["aria-describedby"])}
        className={cn(controlBase, "h-12 leading-none", controlClassName)}
        {...props}
      />
    </FieldFrame>
  )
}

export type TextareaProps = SharedProps & Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, "className">

/** Multi-line version of Field (reference .fix textarea). */
export function Textarea({ label, error, hint, className, controlClassName, id, rows = 4, ...props }: TextareaProps) {
  const auto = React.useId()
  const fid = id ?? auto
  return (
    <FieldFrame id={fid} label={label} error={error} hint={hint} className={className}>
      <textarea
        id={fid}
        rows={rows}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(fid, error, hint, props["aria-describedby"])}
        className={cn(controlBase, "min-h-24 resize-y py-3 leading-[1.55]", controlClassName)}
        {...props}
      />
    </FieldFrame>
  )
}
