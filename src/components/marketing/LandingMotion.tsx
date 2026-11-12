"use client"

import { useEffect } from "react"

/**
 * Landing-page motion director. Renders nothing; wires up behaviour the CSS in marketing.css keys off:
 *  - [data-reveal]  → gets .is-in when it scrolls into view (once), then .is-done when its entrance ends
 *  - [data-stagger] → its [data-reveal] descendants get an index (--i) and reveal together with the group
 *  - .lp-line       → masked heading lines get a line index (--l)
 *  - nav scroll state, reading-progress thread, and scrollspy for the primary nav
 * The inline script in page.tsx adds html.lp-js before first paint; without JS nothing is ever hidden.
 */
export function LandingMotion() {
  useEffect(() => {
    const root = document.documentElement
    ;(window as unknown as { __lpMotion?: boolean }).__lpMotion = true
    root.classList.add("lp-js")

    // Index staggered children and heading lines.
    document.querySelectorAll<HTMLElement>("[data-stagger]").forEach((group) => {
      group.querySelectorAll<HTMLElement>("[data-reveal]").forEach((el, i) => el.style.setProperty("--i", String(i)))
    })
    document.querySelectorAll<HTMLElement>("[data-reveal]").forEach((el) => {
      el.querySelectorAll<HTMLElement>(".lp-line").forEach((line, i) => line.style.setProperty("--l", String(i)))
    })

    const finish = (el: HTMLElement) => {
      el.classList.add("is-in")
      // Drop the entrance delay afterwards so hover transitions respond instantly.
      const ms = parseFloat(getComputedStyle(el).transitionDelay) * 1000 + 1200
      window.setTimeout(() => el.classList.add("is-done"), ms)
    }

    const reveal = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue
          const target = entry.target as HTMLElement
          reveal.unobserve(target)
          if (target.hasAttribute("data-stagger")) {
            target.querySelectorAll<HTMLElement>("[data-reveal]").forEach(finish)
            if (target.hasAttribute("data-reveal")) finish(target)
          } else {
            finish(target)
          }
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0 },
    )
    document.querySelectorAll<HTMLElement>("[data-stagger], [data-reveal]").forEach((el) => {
      // Members of a stagger group are revealed by the group.
      if (el.hasAttribute("data-reveal") && !el.hasAttribute("data-stagger") && el.parentElement?.closest("[data-stagger]")) return
      reveal.observe(el)
    })

    // Nav: scrolled state + reading-progress thread.
    const header = document.querySelector<HTMLElement>("[data-lp-header]")
    const progress = document.querySelector<HTMLElement>("[data-lp-progress]")
    let ticking = false
    const onScroll = () => {
      if (ticking) return
      ticking = true
      requestAnimationFrame(() => {
        ticking = false
        const y = window.scrollY
        header?.toggleAttribute("data-scrolled", y > 8)
        const max = root.scrollHeight - window.innerHeight
        if (progress) progress.style.transform = `scaleX(${max > 0 ? Math.min(1, y / max) : 0})`
        // At the very bottom nothing more can scroll into view: show whatever is still waiting.
        if (y >= max - 2) {
          document.querySelectorAll<HTMLElement>("[data-reveal]:not(.is-in)").forEach((el) => {
            const top = el.getBoundingClientRect().top
            if (top < window.innerHeight) finish(el)
          })
        }
      })
    }
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    window.addEventListener("resize", onScroll)

    // Scrollspy: the nav link for the section crossing the upper third of the screen.
    const links = new Map<string, HTMLElement>()
    document.querySelectorAll<HTMLAnchorElement>("[data-lp-nav] a[href^='#']").forEach((a) => links.set(a.hash.slice(1), a))
    const spy = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const link = links.get(entry.target.id)
          if (!link) continue
          if (entry.isIntersecting) {
            links.forEach((l) => l.removeAttribute("data-active"))
            link.setAttribute("data-active", "")
          } else {
            link.removeAttribute("data-active")
          }
        }
      },
      { rootMargin: "-30% 0px -65% 0px" },
    )
    links.forEach((_, id) => {
      const section = document.getElementById(id)
      if (section) spy.observe(section)
    })

    return () => {
      reveal.disconnect()
      spy.disconnect()
      window.removeEventListener("scroll", onScroll)
      window.removeEventListener("resize", onScroll)
    }
  }, [])

  return null
}

