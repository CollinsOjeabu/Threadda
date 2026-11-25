import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const cardVariants = cva("rounded-td-card border border-td-card-line bg-td-paper", {
  variants: {
    padding: {
      default: "p-7",
      none: "p-0",
    },
    /** Hover lift: 5px up with the soft lift shadow. Use only on clickable cards. */
    lift: {
      true: "transition-[transform,box-shadow] duration-[450ms] ease-td hover:-translate-y-[5px] hover:shadow-[0_20px_40px_-24px_rgba(33,35,44,0.28)]",
      false: "",
    },
  },
  defaultVariants: { padding: "default", lift: false },
})

export type CardProps = React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof cardVariants>

/** Paper card with a card-line border, radius 14, padding 28. */
export function Card({ className, padding, lift, ...props }: CardProps) {
  return <div className={cn(cardVariants({ padding, lift }), className)} {...props} />
}
