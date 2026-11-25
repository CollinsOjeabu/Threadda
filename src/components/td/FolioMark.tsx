import { cn } from "@/lib/utils"

const sizes = {
  22: "size-[22px] text-[14px] border-[1.25px]",
  24: "size-6 text-[15px] border-[1.25px]",
  28: "size-7 text-[17px] border-[1.5px]",
} as const

export type FolioMarkProps = {
  size?: keyof typeof sizes
  /** Accessible name. Leave empty when the name "Folio" is printed beside it. */
  label?: string
  className?: string
}

/** Folio's mark: an upright Instrument Serif ¶ in a circle with an ink border. Shown when Folio talks. */
export function FolioMark({ size = 28, label, className }: FolioMarkProps) {
  return (
    <span
      {...(label ? { role: "img", "aria-label": label } : { "aria-hidden": true })}
      className={cn(
        "grid shrink-0 place-items-center rounded-full border-solid border-td-ink bg-td-paper pb-px font-td-serif not-italic leading-none font-normal text-td-ink",
        sizes[size],
        className,
      )}
    >
      ¶
    </span>
  )
}
