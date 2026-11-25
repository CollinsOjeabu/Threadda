import { Manrope, Instrument_Serif, IBM_Plex_Mono } from "next/font/google"

/**
 * The three Threadda typefaces, shared by the marketing site (.lp-root)
 * and the app (.td-root). Each exposes a CSS variable; the scopes map them
 * to their own font tokens in globals.css.
 */

export const manrope = Manrope({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-manrope",
  display: "swap",
})

// Normal is needed for Folio's upright ¶ mark; italic for headline tails.
export const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-instrument-serif",
  display: "swap",
})

// 500 is kept because the marketing site loaded it before this file existed.
export const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-plex-mono",
  display: "swap",
})

/** Class names that set all three font variables on an element. */
export const fontVariables = `${manrope.variable} ${instrumentSerif.variable} ${plexMono.variable}`
