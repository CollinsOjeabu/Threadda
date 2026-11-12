import type { CSSProperties, ReactNode } from "react"

/** Entrance delay for a [data-reveal] element: style={delay(300)} */
export const delay = (ms: number) => ({ "--d": `${ms}ms` }) as CSSProperties
/** Order of a .lp-follow child (or .lp-bar) after its revealed parent: style={follow(1)} */
export const follow = (n: number) => ({ "--f": n, "--b": n }) as CSSProperties

/** A heading line that rises out of a mask. Use inside an element with data-reveal="lines". */
/** `index` is only needed outside [data-reveal] (the hero); LandingMotion numbers lines elsewhere. */
export function Line({ children, className = "", index }: { children: ReactNode; className?: string; index?: number }) {
  return (
    <span className={`lp-line ${className}`} style={index === undefined ? undefined : ({ "--l": index } as CSSProperties)}>
      <span>{children}</span>
    </span>
  )
}
