"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export type OrbState = "idle" | "reading" | "weaving" | "writing"

export type StateOrbProps = {
  state: OrbState
  /** Diameter in px, 14–72. 64 beside a status line, 14–20 inline. */
  size?: number
  className?: string
}

const INK = "#21232c"
/** The still frame shown before the first animation frame and under reduced motion. */
const STILL_T = 1.2

type Pt = readonly [number, number, number]

/** Evenly spread points on a unit sphere (Fibonacci lattice). */
function fib(n: number): Pt[] {
  const p: Pt[] = []
  const g = Math.PI * (3 - Math.sqrt(5))
  for (let i = 0; i < n; i++) {
    const y = 1 - (i / (n - 1)) * 2
    const r = Math.sqrt(1 - y * y)
    const t = g * i
    p.push([Math.cos(t) * r, y, Math.sin(t) * r])
  }
  return p
}

const clamp01 = (v: number) => Math.max(0, Math.min(1, v))

/**
 * Port of the `draw` function in design/app/reference-onboarding.html, plus the
 * `writing` band from reference-app.html (the onboarding copy has no writing state).
 * Returns SVG markup: one <circle> per visible dot.
 */
function draw(size: number, state: OrbState, pts: Pt[], t: number): string {
  const R = (size / 2) * 0.86
  const c = size / 2
  const big = size >= 48
  const spin = t * 0.45
  const tilt = 0.38
  const ca = Math.cos(spin)
  const sa = Math.sin(spin)
  const cb = Math.cos(tilt)
  const sb = Math.sin(tilt)
  const proj = (x: number, y: number, z: number) => {
    const x1 = x * ca + z * sa
    const z1 = -x * sa + z * ca
    return [c + x1 * R, c + (y * cb - z1 * sb) * R, y * sb + z1 * cb, x1] as const
  }
  const base = big ? 0.95 : 0.8
  const faint = state === "weaving" ? 0.55 : 1
  const scan = Math.sin(t * 1.5)
  let out = ""
  const dot = (x: number, y: number, r: number, a: number) => {
    a = clamp01(a)
    if (a > 0.02) out += `<circle cx="${x.toFixed(2)}" cy="${y.toFixed(2)}" r="${r.toFixed(2)}" fill-opacity="${a.toFixed(2)}"/>`
  }

  for (const [x, y, z] of pts) {
    const [px, py, d, sx] = proj(x, y, z)
    const dp = (d + 1) / 2
    let a = (big ? 0.07 + 0.22 * dp : 0.2 + 0.4 * dp) * faint
    let r = base * (0.55 + 0.6 * dp)
    if (state === "reading") {
      // A scan line sweeps across.
      const b = Math.exp(-((sx - scan) ** 2) / 0.012) * (d > -0.2 ? 1 : 0.3)
      a += 0.75 * b
      r *= 1 + 0.7 * b
    } else if (state === "writing") {
      // A band ripples across.
      const lat = Math.asin(y)
      const lon = Math.atan2(z, x)
      const ctr = 0.38 * Math.sin(2 * lon + t * 2.2)
      const b = Math.exp(-((lat - ctr) ** 2) / 0.03)
      a += 0.6 * b * (0.35 + 0.65 * dp)
      r *= 1 + 0.6 * b
    }
    dot(px, py, r, a)
  }

  if (state === "weaving") {
    // Three dotted strands at 100/65/35%, like the logo.
    const M = big ? 64 : 30
    const al = [1, 0.65, 0.35]
    for (let k = 0; k < 3; k++) {
      for (let i = 0; i < M; i++) {
        const u = i / M
        const lon = u * Math.PI * 2 + k * 2.094
        const lat = 0.58 * Math.sin(2 * u * Math.PI * 2 + t * 1.6 + k * 2.094)
        const [px, py, d] = proj(Math.cos(lat) * Math.cos(lon), Math.sin(lat), Math.cos(lat) * Math.sin(lon))
        const dp = (d + 1) / 2
        dot(px, py, (big ? 1.15 : 0.75) * (0.6 + 0.6 * dp), al[k] * (0.12 + 0.88 * dp))
      }
    }
  }
  return out
}

/**
 * Folio's state orb: a dotted sphere of ink dots, slowly turning. Shown when Folio works.
 * Decorative: the status text beside it carries the meaning.
 */
export function StateOrb({ state, size = 64, className }: StateOrbProps) {
  const s = Math.round(Math.min(72, Math.max(14, size)))
  const ref = React.useRef<SVGGElement>(null)
  const svgRef = React.useRef<SVGSVGElement>(null)
  const pts = React.useMemo(() => fib(s >= 48 ? 320 : 70), [s])

  React.useEffect(() => {
    const g = ref.current
    const svg = svgRef.current
    if (!g || !svg) return
    const paint = (t: number) => {
      g.innerHTML = draw(s, state, pts, t)
    }
    paint(STILL_T)

    const motion = window.matchMedia("(prefers-reduced-motion: reduce)")
    let visible = true
    let raf = 0
    const loop = (now: number) => {
      paint(now / 1000)
      raf = requestAnimationFrame(loop)
    }
    const sync = () => {
      cancelAnimationFrame(raf)
      raf = 0
      if (motion.matches) paint(STILL_T)
      else if (visible) raf = requestAnimationFrame(loop)
    }

    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
      sync()
    })
    io.observe(svg)
    motion.addEventListener("change", sync)
    sync()
    return () => {
      cancelAnimationFrame(raf)
      io.disconnect()
      motion.removeEventListener("change", sync)
    }
  }, [s, state, pts])

  return (
    <svg
      ref={svgRef}
      width={s}
      height={s}
      viewBox={`0 0 ${s} ${s}`}
      aria-hidden="true"
      className={cn("inline-block shrink-0 overflow-visible align-middle", className)}
    >
      <g ref={ref} fill={INK} />
    </svg>
  )
}
