/**
 * Threadda logo for marketing pages: the real mark (from public/images/threadda-logo.svg)
 * drawn in currentColor, plus the "Thread·da" wordmark as live text in Manrope.
 * Set the colour with a text-* class on this element (or a parent).
 */
export function ThreaddaLogo({ className = "" }: { className?: string }) {
  return (
    <span role="img" aria-label="Threadda" className={`inline-flex items-center gap-2.5 ${className}`}>
      <ThreaddaMark className="h-[1.15em] w-[1.15em]" />
      <span aria-hidden="true" className="font-lp-sans leading-none tracking-[-0.01em]">
        <span className="font-light">Thread</span>
        <span className="font-bold">da</span>
      </span>
    </span>
  )
}

/** The mark on its own (decorative; label the surrounding element). Colour via currentColor. */
export function ThreaddaMark({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 52 52"
      aria-hidden="true"
      focusable="false"
      className={`lp-mark shrink-0 ${className}`}
      fill="none"
    >
      <rect width="52" height="52" rx="12" fill="currentColor" />
      <path d="M12 18 C17.5 18 17.5 13 26 13 C34.5 13 34.5 18 40 18" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M12 24 C17.5 24 17.5 19 26 19 C34.5 19 34.5 24 40 24" stroke="#fff" strokeOpacity="0.65" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M12 30 C17.5 30 17.5 25 26 25 C34.5 25 34.5 30 40 30" stroke="#fff" strokeOpacity="0.35" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M12 36 C17.5 36 17.5 31 26 31 C34.5 31 34.5 36 40 36" stroke="#fff" strokeOpacity="0.15" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  )
}
