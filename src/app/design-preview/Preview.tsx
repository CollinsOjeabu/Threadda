"use client"

import * as React from "react"
import {
  Button,
  Card,
  Field,
  FolioMark,
  InlineError,
  Logo,
  Skeleton,
  StateOrb,
  StepBar,
  Tag,
  Textarea,
  Toggle,
  type OrbState,
} from "@/components/td"

const STEPS = ["Your plan", "Your sources", "A few questions", "How you write", "The thread"]
const ORB_STATES: { state: OrbState; label: string }[] = [
  { state: "idle", label: "Idle" },
  { state: "reading", label: "Reading" },
  { state: "weaving", label: "Finding the thread" },
  { state: "writing", label: "Writing" },
]

function Section({ title, note, children }: { title: string; note?: string; children: React.ReactNode }) {
  return (
    <section className="border-t border-td-line-2 py-10">
      <h2 className="m-0 text-[18px] leading-[26px] font-semibold tracking-[-0.02em]">{title}</h2>
      {note && <p className="mt-1 mb-0 text-[13px] leading-[1.5] text-td-muted">{note}</p>}
      <div className="mt-6">{children}</div>
    </section>
  )
}

function Label({ children }: { children: React.ReactNode }) {
  return <p className="m-0 mb-3 text-[12px] leading-[15px] font-medium text-td-muted">{children}</p>
}

export function Preview() {
  const [teach, setTeach] = React.useState<"answer" | "paste">("answer")
  const [platform, setPlatform] = React.useState<"linkedin" | "x" | "both">("linkedin")

  return (
    <>
      <header className="flex h-[68px] items-center justify-between border-b border-td-line px-10">
        <Logo />
        <StepBar step={2} name="Your sources" />
      </header>

      <main className="mx-auto w-full max-w-[960px] px-10 pt-24 pb-32">
        <h1 className="m-0 mb-5 text-[46px] leading-[1.08] font-medium tracking-[-0.05em] text-balance">
          The app’s building{" "}
          <em className="font-td-serif text-[1.08em] leading-none font-normal tracking-[-0.01em]">blocks.</em>
        </h1>
        <p className="m-0 mb-10 max-w-[34rem] text-[15px] leading-[1.6] text-td-body">
          Every shared component in every state. Compare against design/app/reference-onboarding.html and
          reference-app.html. Development only.
        </p>

        <Section title="Logo" note="Mark plus wordmark at 22, 28 and 40.">
          <div className="flex flex-wrap items-center gap-10">
            <Logo size={22} />
            <Logo />
            <Logo size={40} />
            <Logo size={40} markOnly />
          </div>
        </Section>

        <Section
          title="Buttons"
          note="A gallery: in a real view, only one primary. Outline can carry an ink chip with a cream arrow (arrow prop). Hover turns the chip; press scales to 0.97."
        >
          {(["md", "default", "sm"] as const).map((size) => (
            <div key={size} className="mb-6">
              <Label>
                {size === "md" ? "Medium, 48px" : size === "default" ? "Default, 42px" : "Small, 36px"}
              </Label>
              <div className="flex flex-wrap items-center gap-5">
                <Button size={size}>Save my voice</Button>
                <Button size={size} variant="outline">
                  Second opinion
                </Button>
                <Button size={size} variant="outline" arrow>
                  Schedule
                </Button>
                <Button size={size} variant="text">
                  Push back
                </Button>
                <Button size={size} disabled>
                  Disabled
                </Button>
              </div>
            </div>
          ))}
          <Label>As a link (href) and through asChild</Label>
          <div className="flex flex-wrap items-center gap-5">
            <Button href="#buttons" variant="outline">
              Go with href
            </Button>
            <Button asChild variant="outline" arrow={false}>
              <a href="#buttons">An anchor via asChild</a>
            </Button>
          </div>
        </Section>

        <Section title="Folio mark" note="Upright ¶ in Instrument Serif. Sizes 22, 24, 28.">
          <div className="flex items-center gap-6">
            <FolioMark size={22} />
            <FolioMark size={24} />
            <FolioMark size={28} />
            <span className="flex items-center gap-2.5 text-[13px] leading-[1.4] text-td-body">
              <FolioMark size={28} />
              <span>
                <b className="font-semibold text-td-ink">Folio</b> · for LinkedIn
              </span>
            </span>
          </div>
        </Section>

        <Section title="Step bar" note="Steps 1 to 5.">
          <div className="flex flex-col items-start gap-4">
            {STEPS.map((name, i) => (
              <StepBar key={name} step={i + 1} name={name} />
            ))}
          </div>
        </Section>

        <Section title="Card">
          <div className="grid gap-5 md:grid-cols-2">
            <Card>
              <p className="m-0 text-[12px] font-medium text-td-muted">Your angle for LinkedIn</p>
              <p className="mt-2 mb-0 text-[20px] leading-7 font-medium tracking-[-0.03em]">
                Nobody monitors the model they forgot they shipped.
              </p>
            </Card>
            <Card lift tabIndex={0}>
              <p className="m-0 text-[12px] font-medium text-td-muted">With hover lift</p>
              <p className="mt-2 mb-0 text-[14px] leading-[1.6] text-td-body">
                Clickable cards rise 5px with a soft shadow.
              </p>
            </Card>
          </div>
        </Section>

        <Section title="Fields" note="Normal, focused (forced here) and error.">
          <div className="grid gap-6 md:grid-cols-3">
            <Field label="Your name" placeholder="Ada Lovelace" />
            <Field
              label="Email"
              defaultValue="ada@example.com"
              controlClassName="border-td-blue bg-td-paper"
            />
            <Field
              label="LinkedIn profile"
              defaultValue="linkedin.com/ada"
              error="That link isn’t a profile. Paste the address from your profile page."
            />
          </div>
          <Textarea
            className="mt-6"
            label="Paste a post you’ve written"
            placeholder="The one you were proudest of…"
            hint="Folio only reads it to learn how you write."
          />
        </Section>

        <Section title="Toggle" note="2 and 3 options. Uses aria-pressed.">
          <div className="flex flex-col gap-5">
            <Toggle
              label="How to teach Folio"
              value={teach}
              onChange={setTeach}
              options={[
                { value: "answer", label: "Answer 3 questions" },
                { value: "paste", label: "Paste posts you’ve written" },
              ]}
            />
            <Toggle
              label="Platform"
              value={platform}
              onChange={setPlatform}
              options={[
                { value: "linkedin", label: "LinkedIn" },
                { value: "x", label: "X" },
                { value: "both", label: "Both" },
              ]}
            />
          </div>
        </Section>

        <Section title="Tags">
          <div className="flex flex-wrap gap-2">
            <Tag>Your voice</Tag>
            <Tag>Essay</Tag>
            <Tag>LinkedIn post</Tag>
            <Tag active>Active</Tag>
          </div>
        </Section>

        <Section title="Inline error">
          <InlineError title="Your payment didn’t go through.">
            Your bank declined the card, so nothing was charged. Try again, or use a different card.
          </InlineError>
        </Section>

        <Section title="Skeletons" note="Slow sheen. Still under reduced motion.">
          <div className="max-w-[560px]">
            <Skeleton variant="heading" className="mb-5 w-[88%]" />
            {[96, 72, 58, 90, 40].map((w) => (
              <Skeleton key={w} className="mb-3" style={{ width: `${w}%` }} />
            ))}
          </div>
        </Section>

        <Section title="State orb" note="All four states at 16px and 64px. Decorative; the text carries the meaning.">
          <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-4">
            {ORB_STATES.map(({ state, label }) => (
              <div key={state} className="flex flex-col items-start gap-4">
                <StateOrb state={state} size={64} />
                <span className="flex items-center gap-2 text-[12px] font-medium text-td-muted">
                  <StateOrb state={state} size={16} />
                  {label}
                </span>
              </div>
            ))}
          </div>
        </Section>
      </main>
    </>
  )
}
