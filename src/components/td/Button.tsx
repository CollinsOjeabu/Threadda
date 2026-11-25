import * as React from "react"
import Link from "next/link"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

/**
 * Threadda app button (design/app/DESIGN.md §5, reference .btn).
 * One `primary` per view. Labels start with a verb, sentence case.
 */
const buttonVariants = cva(
  [
    "group/btn inline-flex shrink-0 items-center whitespace-nowrap rounded-td-pill font-td-sans text-[13px] leading-4 no-underline",
    "cursor-pointer select-none",
    "transition-[background-color,color,border-color,transform] duration-200 ease-td",
    "active:scale-[0.97]",
    "outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-td-blue",
    "disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50",
  ],
  {
    variants: {
      variant: {
        primary: "gap-2.5 border-0 bg-td-blue font-semibold text-white hover:bg-td-blue-700",
        outline:
          "justify-center border border-td-ink/15 bg-transparent font-medium text-td-ink hover:border-td-ink/30",
        text: "justify-center border-0 bg-transparent px-2.5 font-medium text-td-body hover:text-td-ink",
      },
      size: {
        md: "h-12",
        default: "h-[42px]",
        sm: "h-9 text-[12.5px]",
      },
    },
    compoundVariants: [
      // Primary carries the ↗ chip, so the right padding hugs it.
      { variant: "primary", size: "md", className: "pl-[22px] pr-2" },
      { variant: "primary", size: "default", className: "pl-5 pr-1.5" },
      { variant: "primary", size: "sm", className: "pl-3.5 pr-1" },
      { variant: "outline", size: "md", className: "px-[22px]" },
      { variant: "outline", size: "default", className: "px-[18px]" },
      { variant: "outline", size: "sm", className: "px-3.5" },
    ],
    defaultVariants: { variant: "primary", size: "default" },
  },
)

const chipSize = {
  md: "size-8 [&>svg]:size-3",
  default: "size-[30px] [&>svg]:size-[11px]",
  sm: "size-7 [&>svg]:size-2.5",
} as const

export function ArrowUpRight(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 12 12"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M3 9 9 3M4 3h5v5" />
    </svg>
  )
}

type ButtonOwnProps = VariantProps<typeof buttonVariants> & {
  /** Show the ↗ chip. Defaults to true for `primary`, false otherwise. */
  arrow?: boolean
  /** Render the single child element (e.g. a Link) with the button's styles. */
  asChild?: boolean
  /** Render as a Next.js link. */
  href?: string
}

export type ButtonProps = ButtonOwnProps &
  Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, keyof ButtonOwnProps>

// Right padding when an outline button carries a chip, so it hugs the chip like primary does.
const outlineChipPadding = {
  md: "pl-[22px] pr-2",
  default: "pl-5 pr-1.5",
  sm: "pl-3.5 pr-1",
} as const

function Chip({ size, tone }: { size: keyof typeof chipSize; tone: "light" | "ink" }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "grid shrink-0 place-items-center rounded-full transition-transform duration-200 ease-td group-hover/btn:rotate-45",
        // On blue: white 20%. On an outline pill: ink chip with a cream arrow (DESIGN.md §5).
        tone === "ink" ? "bg-td-ink text-td-cream" : "bg-white/20",
        chipSize[size],
      )}
    >
      <ArrowUpRight />
    </span>
  )
}

export function Button({
  variant = "primary",
  size = "default",
  arrow,
  asChild = false,
  href,
  className,
  children,
  type,
  ...props
}: ButtonProps) {
  const v = variant ?? "primary"
  const s = size ?? "default"
  const showChip = arrow ?? v === "primary"
  const tone = v === "primary" ? "light" : "ink"
  const classes = cn(
    buttonVariants({ variant: v, size: s }),
    showChip && v === "outline" && cn("gap-2.5", outlineChipPadding[s]),
    className,
  )
  const chip = showChip && <Chip size={s} tone={tone} />
  const content = (
    <>
      {children}
      {chip}
    </>
  )

  if (asChild && React.isValidElement<{ className?: string; children?: React.ReactNode }>(children)) {
    const child = children
    return React.cloneElement(child, {
      className: cn(classes, child.props.className),
      children: (
        <>
          {child.props.children}
          {chip}
        </>
      ),
    })
  }

  if (href !== undefined) {
    return (
      <Link
        href={href}
        className={classes}
        {...(props as Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href">)}
      >
        {content}
      </Link>
    )
  }

  return (
    <button type={type ?? "button"} className={classes} {...props}>
      {content}
    </button>
  )
}

export { buttonVariants }
