import * as React from "react"
import { fontVariables } from "@/lib/fonts"
import { cn } from "@/lib/utils"

export type TdRootProps = React.HTMLAttributes<HTMLDivElement>

/**
 * The scope every new app screen sits in: applies .td-root (paper, ink,
 * Manrope 14/1.6, light colour scheme) and the three font variables, so
 * font-td-* utilities resolve inside it.
 */
export function TdRoot({ className, ...props }: TdRootProps) {
  return <div className={cn("td-root", fontVariables, className)} {...props} />
}
