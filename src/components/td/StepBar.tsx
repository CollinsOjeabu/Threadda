import { cn } from "@/lib/utils"

export type StepBarProps = {
  /** Current step, 1-based. */
  step: number
  /** Total steps. Onboarding has 5. */
  total?: number
  /** The current step's name, sentence case ("Your sources"). */
  name: string
  className?: string
}

/** Right side of the flow top bar: step name, "n of 5", and thin progress segments. */
export function StepBar({ step, total = 5, name, className }: StepBarProps) {
  const current = Math.min(Math.max(step, 1), total)
  return (
    <div className={cn("flex items-center gap-3 font-td-sans text-[13px] leading-none text-td-muted", className)}>
      <span className="font-medium text-td-ink">{name}</span>
      <span>
        {current} of {total}
      </span>
      <span
        role="progressbar"
        aria-label="Progress"
        aria-valuemin={1}
        aria-valuemax={total}
        aria-valuenow={current}
        aria-valuetext={`Step ${current} of ${total}: ${name}`}
        className="flex gap-1"
      >
        {Array.from({ length: total }, (_, i) => (
          <i
            key={i}
            className={cn("block h-0.5 w-[22px] rounded-[2px]", i < current ? "bg-td-blue" : "bg-td-line-2")}
          />
        ))}
      </span>
    </div>
  )
}
