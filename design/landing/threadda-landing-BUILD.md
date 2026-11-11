# Threadda landing — build brief for Claude Code

`threadda-landing.html` is a **pixel-faithful replica of the live Base44 design**, measured directly off the rendered page (fonts, hex, sizes, spacing, and verbatim copy). Port it into the Next.js + Tailwind repo — don't redesign it, and keep the copy exactly.

## Measured design system (use these exact values)

**Fonts** (Google Fonts — load via `next/font/google`):
- **Manrope** — display *and* body. Headlines are Manrope **500**; card/list titles **600**; body **400**.
- **Instrument Serif** — the italic accent words only (`takes.`, `point of view.`, `another story.`, `yourself.`, `the summary.`, etc.). Weight **400, italic**, set inline at the parent heading's size.
- **IBM Plex Mono** — overlines, numerals, meta. 10px, uppercase, letter-spacing 0.16em.

**Colors:**
| token | hex | use |
|---|---|---|
| cream | `#f7f7f2` | page bg (landing only — app stays white) |
| paper | `#fdfdfc` | cards / raised surfaces |
| panel | `#f1f0e9` | faint tinted sections (How-it-works, Who-it's-for) |
| ink | `#21232c` | primary text |
| muted | `#6b6d76` | overlines / meta |
| body | `#54565f` | body copy |
| blue | `#3750f1` | PRIMARY accent — buttons, hero italic, links |
| lime | `#e5eba3` | SECONDARY accent — dark-section italics + final CTA panel |
| navy | `#1b2031` | dark Voice section ground |
| line | `rgba(33,35,44,0.10)` | hairline |

**Type scale (measured):** H1 `108.8px` / Manrope 500 / tracking `-0.055em` / line-height `0.94`. Big section H2s `70.4px` (tracking ~`-0.065em`), the blue "point of view" H2 ~`100px`, medium H2 `46.4px`. Card titles `20px/600`, list + ICP titles `18px/600`, body `14–15px`. All large headings use `clamp()` in the HTML so they scale down cleanly.

**Layout:** content container `max-width: 1320px`, side padding 24–40px. Plain sections use **128px** top/bottom padding; hero is `pt-150 / pb-64`. Full-bleed sections (panel, navy, blue, lime) run edge-to-edge with the container nested inside.

**Buttons:** fully rounded pill (`border-radius: 9999px`), `blue` bg, white text, ~12–13px **600**. The circular `↗` chip on the hero CTA uses `bg-white/20`.

## Port notes
- Build as a **Server Component** page (`app/(marketing)/page.tsx`); sections as components in `components/marketing/`.
- Only three Client Components needed: **FAQ** (the `<details>` work as-is, or animate), the **publish toggle** (LinkedIn/X/Both, default Both), and the **early-access form**.
- Lift the inline `tailwind.config` (colors + fontFamily) into `tailwind.config.ts → theme.extend`. Recreate the helper classes (`.h-display`, `.serif-i`, `.overline`, `.num`) as `@layer` utilities or component classes.
- **Logo:** placeholder wordmark in the HTML — swap for the real Threadda mark. It sits on cream, blue, and navy grounds, so ship light + dark variants (or a `currentColor` SVG).
- **Early-access form:** wire submit (`email` + `platform`) to a Convex `waitlist` mutation or form endpoint; validate, show success/error.
- **Keep it honest:** no fabricated logos, user counts, testimonials, or metrics — the page has none; don't add any. No Kindle/podcast/integrations copy (not built).

## Fidelity caveats
- The **product mocks** (workbench, LinkedIn/X posts, voiceprint bars) are pure HTML/CSS recreations — faithful to the layout, not screenshots. Swap for real captures later if you prefer.
- Exact per-element margins in Base44's generated markup weren't all measured; spacing here matches the visual rhythm (128px sections, measured type scale) and will read as the same page. Fine-tune against the live page side-by-side if you want 1px parity.
